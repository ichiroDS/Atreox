/* api/contact.js — the contact form's only backend.
 *
 * Exists because there was no single place for a customer to reach us.
 * The footer gave hello@atreoxai.com, the legal pages gave a personal
 * Gmail (fixed 2026-08-27), and people were writing to whatever they
 * found — one to a personal address, one waiting in Discord. This puts
 * every enquiry in one inbox.
 *
 * Nothing is stored. The submission is validated, checked for spam, sent
 * as an email, and forgotten. That is deliberate: a database of enquiries
 * is personal data we would have to declare, retain, secure and delete,
 * to no benefit that an inbox does not already give.
 *
 * No new npm dependencies. Resend and Turnstile are both plain HTTPS
 * APIs and Node 18 has fetch, so package.json is untouched and the
 * existing build is unaffected.
 *
 * Environment variables (Vercel → Project → Settings → Environment
 * Variables). The function FAILS CLOSED if either is missing: a contact
 * form that silently accepts everything while its spam check is
 * unconfigured is worse than one that is visibly down.
 *
 *   RESEND_API_KEY        — Resend API key. The sending domain must be
 *                           verified in Resend first, or Resend rejects
 *                           the send.
 *   TURNSTILE_SECRET_KEY  — Cloudflare Turnstile secret for the widget
 *                           whose site key is in the front-end.
 *   CONTACT_TO            — optional; defaults to hello@atreoxai.com.
 *   CONTACT_FROM          — optional; defaults to the address below, which
 *                           must be on the domain verified in Resend.
 */

const TO_DEFAULT = 'hello@atreoxai.com';
const FROM_DEFAULT = 'ATREOX AI <noreply@atreoxai.com>';

const TOPICS = {
  billing: 'Billing',
  technical: 'Technical',
  refund: 'Refund',
  other: 'Other',
};

const MAX = { name: 100, email: 200, message: 5000 };

// Bots fill every field they find, including one that is hidden and has
// no business being filled. Named plausibly rather than "honeypot" - a
// scraper reads the name attribute, not the intent.
const HONEYPOT_FIELD = 'company_website';

// A human cannot read the form, decide what to say, and type it in under
// this. A script posts in milliseconds. Cheap, and it costs a real user
// nothing because they were never going to be this fast.
const MIN_FILL_SECONDS = 3;

// Burst guard, per warm instance. Deliberately modest about what it is:
// serverless instances are not shared, so this catches a single source
// hammering one instance, not a distributed flood. Turnstile is the real
// defence. If a proper cross-instance limit is ever wanted, Upstash Redis
// is already in the organisation's stack and this is where it would go.
const RATE = { windowMs: 60_000, max: 3 };
const recentByIp = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const hits = (recentByIp.get(ip) || []).filter(t => now - t < RATE.windowMs);
  hits.push(now);
  recentByIp.set(ip, hits);
  // Bound the map so a long-lived instance cannot grow one entry per
  // attacker IP forever.
  if (recentByIp.size > 500) {
    for (const [key, times] of recentByIp) {
      if (times.every(t => now - t >= RATE.windowMs)) recentByIp.delete(key);
    }
  }
  return hits.length > RATE.max;
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

// Deliberately permissive. The point is to catch a typo before it becomes
// an unanswerable enquiry, not to adjudicate RFC 5322 - every strict
// email regex ever written rejects somebody's real address.
function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
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

async function sendEmail({ apiKey, to, from, replyTo, subject, text }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], reply_to: replyTo, subject, text }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Resend ${res.status}: ${detail.slice(0, 300)}`);
  }
}

module.exports = async (req, res) => {
  // Same-origin only. No Access-Control-Allow-Origin header is set on
  // purpose - unlike api/fetch-txt.js, which is a public read, nothing
  // should be posting here from another site.
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (!resendKey || !turnstileSecret) {
    // Loud in the logs, vague to the caller: a probe should not learn
    // which half of the configuration is missing.
    console.error('contact: missing RESEND_API_KEY and/or TURNSTILE_SECRET_KEY');
    return res.status(503).json({ error: 'The contact form is temporarily unavailable.' });
  }

  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many messages. Please try again in a minute.' });
  }

  const body = typeof req.body === 'object' && req.body ? req.body : {};
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const topic = String(body.topic || '').trim();
  const message = String(body.message || '').trim();
  const token = String(body.turnstileToken || '');
  const honeypot = String(body[HONEYPOT_FIELD] || '').trim();
  const elapsed = Number(body.elapsedSeconds);

  // Both silent traps answer 200 with the same shape a success has. A bot
  // that is told it was caught is a bot whose author fixes it; one that
  // believes it succeeded goes away. Nothing is sent either way.
  if (honeypot) {
    console.warn('contact: honeypot filled, dropped', { ip });
    return res.status(200).json({ ok: true });
  }
  if (Number.isFinite(elapsed) && elapsed < MIN_FILL_SECONDS) {
    console.warn('contact: submitted too fast, dropped', { ip, elapsed });
    return res.status(200).json({ ok: true });
  }

  const problems = [];
  if (!name) problems.push('name');
  if (!email || !looksLikeEmail(email)) problems.push('email');
  if (!TOPICS[topic]) problems.push('topic');
  if (!message) problems.push('message');
  if (name.length > MAX.name || email.length > MAX.email || message.length > MAX.message) {
    problems.push('length');
  }
  if (problems.length) {
    return res.status(400).json({ error: 'Please check the form.', fields: problems });
  }

  if (!token || !(await verifyTurnstile(token, ip, turnstileSecret))) {
    return res.status(400).json({ error: 'Could not verify you are human. Please try again.' });
  }

  // Newlines in a header field are how header injection works. The topic
  // is already constrained to the map above, but the name is free text and
  // goes into the subject line.
  const safeName = name.replace(/[\r\n]+/g, ' ');
  const subject = `[${TOPICS[topic]}] ${safeName}`;
  const text = [
    `Topic:   ${TOPICS[topic]}`,
    `Name:    ${safeName}`,
    `Email:   ${email}`,
    '',
    message,
    '',
    '--',
    'Sent from the contact form at atreoxai.com/contact',
  ].join('\n');

  try {
    await sendEmail({
      apiKey: resendKey,
      to: process.env.CONTACT_TO || TO_DEFAULT,
      from: process.env.CONTACT_FROM || FROM_DEFAULT,
      // So hitting Reply in the inbox answers the customer rather than
      // the noreply sender.
      replyTo: email,
      subject,
      text,
    });
  } catch (err) {
    // The message is in the request and nowhere else - there is no stored
    // copy to recover it from, by design. So the log line has to carry
    // enough to answer the person if the send failed, without becoming a
    // second store of enquiries: who, and about what, not the body.
    console.error('contact: send failed', { ip, email, topic, error: err.message });
    return res.status(502).json({ error: 'Could not send your message. Please email hello@atreoxai.com.' });
  }

  return res.status(200).json({ ok: true });
};

module.exports.HONEYPOT_FIELD = HONEYPOT_FIELD;
module.exports.MIN_FILL_SECONDS = MIN_FILL_SECONDS;
module.exports.TOPICS = TOPICS;
