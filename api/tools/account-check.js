/* api/tools/account-check.js — the PUBLIC account checker's bridge.
 *
 * Same bridge role as tools/proxy-check.js (attaches the engine master
 * bearer, marks the call public, forwards the real visitor IP for the
 * 3/hour quota), with two differences the account checker needs:
 *
 *   1. Cloudflare Turnstile. The proxy checker takes no file; this one takes
 *      an uploaded session, so it is gated by the same Turnstile the contact
 *      form uses (TURNSTILE_SECRET_KEY). A failed/absent token is rejected
 *      before the engine is touched.
 *
 *   2. The upload. The browser sends the raw .session bytes as the request
 *      body with the Turnstile token in X-Turnstile-Token; this function
 *      verifies the token, then forwards the bytes to the engine as a
 *      multipart `file` field (what the engine's endpoint expects). The
 *      session is never written to disk here and never logged - it passes
 *      straight through. Deletion and every other session guarantee live in
 *      the engine (src/account_probe_public.py).
 *
 * Environment (Vercel → Project → Settings):
 *   ENGINE_API_BASE_URL, ENGINE_API_TOKEN — as tools/proxy-check.js.
 *   TURNSTILE_SECRET_KEY — the same secret the contact form uses.
 */

const crypto = require('crypto');

// A Telethon .session is tens of KB; the cap mirrors the engine's
// ACCOUNT_SESSION_MAX_BYTES so an oversized/junk upload is refused here first.
const MAX_BYTES = 2 * 1024 * 1024;

const RATE = { windowMs: 60_000, max: 12 };
const recentByIp = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const hits = (recentByIp.get(ip) || []).filter((t) => now - t < RATE.windowMs);
  hits.push(now);
  recentByIp.set(ip, hits);
  if (recentByIp.size > 500) {
    for (const [key, times] of recentByIp) {
      if (times.every((t) => now - t >= RATE.windowMs)) recentByIp.delete(key);
    }
  }
  return hits.length > RATE.max;
}

function clientIp(req) {
  const cf = req.headers['cf-connecting-ip'];
  if (typeof cf === 'string' && cf.length) return cf.trim();
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  const real = req.headers['x-real-ip'];
  if (typeof real === 'string' && real.length) return real.trim();
  return req.socket?.remoteAddress || 'unknown';
}

async function verifyTurnstile(token, ip, secret) {
  const body = new URLSearchParams({ secret, response: token });
  if (ip && ip !== 'unknown') body.set('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await res.json().catch(() => ({}));
  return data.success === true;
}

function readRaw(req, maxBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (c) => {
      total += c.length;
      if (total > maxBytes) {
        reject(Object.assign(new Error('too large'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const base = process.env.ENGINE_API_BASE_URL;
  const token = process.env.ENGINE_API_TOKEN;
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (!base || !token || !turnstileSecret) {
    console.error('tools/account-check: missing ENGINE_API_BASE_URL, ENGINE_API_TOKEN and/or TURNSTILE_SECRET_KEY');
    return res.status(503).json({ detail: 'The account checker is temporarily unavailable.' });
  }

  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return res
      .status(429)
      .json({ detail: { message: 'Too many requests. Try again in a minute.', retry_after: 60 } });
  }

  const turnstileToken = String(req.headers['x-turnstile-token'] || '');
  if (!turnstileToken || !(await verifyTurnstile(turnstileToken, ip, turnstileSecret))) {
    return res.status(400).json({ detail: 'Please complete the verification and try again.' });
  }

  let fileBuf;
  try {
    fileBuf = Buffer.isBuffer(req.body) ? req.body : await readRaw(req, MAX_BYTES);
  } catch (err) {
    if (err?.statusCode === 413) {
      return res.status(400).json({ detail: 'That file is too large to be a session.' });
    }
    return res.status(400).json({ detail: 'Could not read the uploaded file.' });
  }
  if (!fileBuf || fileBuf.length === 0) {
    return res.status(400).json({ detail: 'The uploaded session file is empty.' });
  }
  if (fileBuf.length > MAX_BYTES) {
    return res.status(400).json({ detail: 'That file is too large to be a session.' });
  }

  // Build a minimal multipart body with one `file` part - what the engine's
  // UploadFile endpoint expects. The bytes are copied once, here, and never
  // written to disk or logged.
  const boundary = '----atreox' + crypto.randomBytes(12).toString('hex');
  const pre = Buffer.from(
    `--${boundary}\r\n` +
      'Content-Disposition: form-data; name="file"; filename="upload.session"\r\n' +
      'Content-Type: application/octet-stream\r\n\r\n',
  );
  const post = Buffer.from(`\r\n--${boundary}--\r\n`);
  const multipart = Buffer.concat([pre, fileBuf, post]);

  try {
    const upstream = await fetch(`${base.replace(/\/$/, '')}/v1/tools/account-check`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'X-Tool-Scope': 'public',
        'X-Public-Client-IP': ip,
      },
      body: multipart,
    });
    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.send(text);
  } catch (err) {
    console.error('tools/account-check: engine unreachable', err?.message);
    return res.status(503).json({ detail: 'Could not reach the checker right now.' });
  }
};

// Raw body: we read the stream ourselves (or use the Buffer Vercel provides
// for octet-stream), so the platform must not try to parse it as JSON.
module.exports.config = { api: { bodyParser: false } };
