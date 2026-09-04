/* api/tools/proxy-check.js — the PUBLIC proxy checker's bridge to the engine.
 *
 * The engine sits entirely behind a master bearer token; only a server-side
 * holder of that token can call it. This function is that holder for the
 * public, account-less surface: it attaches the token, tells the engine this
 * is a PUBLIC call (X-Tool-Scope: public) and hands it the real visitor IP
 * (X-Public-Client-IP) that the engine meters the 3/hour quota against. The
 * token never reaches the browser.
 *
 * The engine decides the quota and returns its own 429 body when it is spent;
 * this function forwards that verbatim so the page can show the "come back /
 * go unlimited in the panel" screen. Nothing about the proxy is stored here.
 *
 * Environment (Vercel → Project → Settings):
 *   ENGINE_API_BASE_URL — the engine's base URL, e.g. https://api.atreoxai.com
 *   ENGINE_API_TOKEN    — the engine master bearer (API_AUTH_TOKEN on the
 *                         server). Server-only; never exposed to the client.
 * Fails 503 (loud in logs, vague to the caller) if either is missing.
 */

// Best-effort per-IP burst slow, same shape as api/contact.js. The real
// limit is the engine's DB-backed 3/hour; this only blunts a rapid retry
// loop hitting one serverless instance.
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

// The real client IP. Cloudflare (if it fronts the site) sets
// cf-connecting-ip; otherwise Vercel's x-forwarded-for carries the client as
// its first hop. This is the value the engine meters the public quota by, so
// it must be the visitor, never the edge.
function clientIp(req) {
  const cf = req.headers['cf-connecting-ip'];
  if (typeof cf === 'string' && cf.length) return cf.trim();
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  const real = req.headers['x-real-ip'];
  if (typeof real === 'string' && real.length) return real.trim();
  return req.socket?.remoteAddress || 'unknown';
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const base = process.env.ENGINE_API_BASE_URL;
  const token = process.env.ENGINE_API_TOKEN;
  if (!base || !token) {
    console.error('tools/proxy-check: missing ENGINE_API_BASE_URL and/or ENGINE_API_TOKEN');
    return res.status(503).json({ detail: 'The proxy checker is temporarily unavailable.' });
  }

  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return res
      .status(429)
      .json({ detail: { message: 'Too many requests. Try again in a minute.', retry_after: 60 } });
  }

  const body = typeof req.body === 'object' && req.body ? req.body : {};

  // ONE function for both shapes. `{lines: [...]}` goes to the batch
  // endpoint, anything else to the single check. Routed on the body rather
  // than on a second serverless function because everything around it - the
  // token, the scope header, the client IP, the burst slow, the verbatim 429
  // pass-through - is identical, and a second copy of that is a second place
  // for the public IP to stop being forwarded correctly.
  //
  // The lines are NOT parsed here. The engine's src/proxy_parser.py is the
  // only thing in the system that knows what a proxy line looks like; a copy
  // of that grammar in JavaScript is exactly the kind of second opinion that
  // cost us a week. Splitting a textarea on newlines is not a grammar.
  const isBatch = Array.isArray(body.lines);
  const path = isBatch ? '/v1/tools/proxy-check/batch' : '/v1/tools/proxy-check';

  try {
    const upstream = await fetch(`${base.replace(/\/$/, '')}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Tool-Scope': 'public',
        'X-Public-Client-IP': ip,
      },
      body: JSON.stringify(body),
    });
    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.send(text);
  } catch (err) {
    console.error('tools/proxy-check: engine unreachable', err?.message);
    return res.status(503).json({ detail: 'Could not reach the checker right now.' });
  }
};
