/* api/tools/handoff.js — "ask a person about this result", from a checker.
 *
 * The ONE lead capture on the free tools. After a bad verdict the visitor
 * may leave a Telegram @username; this sends it, with which tool and which
 * verdict, to the same inbox the contact form uses, and forgets it. A person
 * replies on Telegram, once, about that result.
 *
 * WHY A TELEGRAM USERNAME AND NOT AN E-MAIL. The people using these tools
 * work in Telegram; an e-mail address is a second channel for us to run and
 * for them to check. WHY NOT A BOT. @atreoxaibot is a different product (tools
 * for creators) whose code is not in our repositories, and nothing about a
 * proxy verdict belongs in it.
 *
 * WHAT IS ACCEPTED, AND NOTHING ELSE: the username, the tool (proxy |
 * account), a verdict key from a fixed list, and for a proxy the two-letter
 * country Telegram reported. No proxy host, port, login or password, and no
 * session file - the page does not send them and this refuses any body that
 * carries extra fields, so a future edit cannot quietly start collecting
 * them. Nothing is stored here or anywhere else; the e-mail is the record.
 *
 * Environment: RESEND_API_KEY, TURNSTILE_SECRET_KEY (both shared with
 * api/contact.js); CONTACT_TO / CONTACT_FROM optional, same defaults.
 * Fails closed with 503 if either key is missing.
 */

const TO_DEFAULT = 'hello@atreoxai.com';
const FROM_DEFAULT = 'ATREOX AI <noreply@atreoxai.com>';

const VERDICTS = {
  proxy: ['tcp_failed', 'telegram_failed', 'exit_not_held'],
  account: ['session_not_usable', 'frozen', 'write_forbidden', 'cannot_resolve'],
};
const ALLOWED_FIELDS = new Set(['username', 'tool', 'verdict', 'country']);
const USERNAME_RE = /^@?[A-Za-z][A-Za-z0-9_]{4,31}$/;

const RATE = { windowMs: 60_000, max: 3 };
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
  return req.socket?.remoteAddress || 'unknown';
}

/* Pure, exported for scripts/verify-tool-next-steps.mjs. Returns
   { ok: true, lead } or { ok: false, error }. */
function validate(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Nothing was sent.' };
  const extra = Object.keys(body).filter((k) => !ALLOWED_FIELDS.has(k));
  if (extra.length) return { ok: false, error: 'Unexpected fields in the request.' };
  const username = String(body.username || '').trim();
  const tool = String(body.tool || '');
  const verdict = String(body.verdict || '');
  const country = body.country == null ? null : String(body.country);
  if (!USERNAME_RE.test(username)) {
    return { ok: false, error: 'That does not look like a Telegram username (5–32 letters, digits or _).' };
  }
  if (!VERDICTS[tool] || !VERDICTS[tool].includes(verdict)) {
    return { ok: false, error: 'Unknown result.' };
  }
  if (country != null && !/^[A-Z]{2}$/.test(country)) {
    return { ok: false, error: 'Unknown result.' };
  }
  return {
    ok: true,
    lead: { username: '@' + username.replace(/^@/, ''), tool, verdict, country },
  };
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

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ detail: 'Method not allowed' });
  }
  const resendKey = process.env.RESEND_API_KEY;
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (!resendKey || !turnstileSecret) {
    console.error('tools/handoff: missing RESEND_API_KEY and/or TURNSTILE_SECRET_KEY');
    return res.status(503).json({ detail: 'This is temporarily unavailable.' });
  }
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return res.status(429).json({ detail: 'Too many requests. Try again in a minute.' });
  }

  const checked = validate(typeof req.body === 'object' ? req.body : null);
  if (!checked.ok) return res.status(400).json({ detail: checked.error });

  const token = String(req.headers['x-turnstile-token'] || '');
  if (!token || !(await verifyTurnstile(token, ip, turnstileSecret))) {
    return res.status(400).json({ detail: 'Please complete the verification and try again.' });
  }

  const { username, tool, verdict, country } = checked.lead;
  const text = [
    `Telegram: ${username}`,
    `Tool:     ${tool} checker`,
    `Verdict:  ${verdict}${country ? ` (Telegram country ${country})` : ''}`,
    '',
    'They asked to be messaged once, on Telegram, about this result.',
    'We do not have their proxy, login or session - ask them for what you need.',
    '',
    '--',
    'Sent from the "ask a person" link under a checker result at atreoxai.com/tools',
  ].join('\n');

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || FROM_DEFAULT,
        to: [process.env.CONTACT_TO || TO_DEFAULT],
        subject: `[Checker] ${username} — ${tool}: ${verdict}`,
        text,
      }),
    });
    if (!r.ok) throw new Error(`Resend ${r.status}`);
  } catch (err) {
    console.error('tools/handoff: send failed', { tool, verdict, error: err.message });
    return res.status(502).json({ detail: 'Could not send. Please write to hello@atreoxai.com.' });
  }
  return res.status(200).json({ ok: true });
};

module.exports.validate = validate;
module.exports.VERDICTS = VERDICTS;
