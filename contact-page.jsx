/* ══════════════════════════════════════════════════════════════════
   contact-page.jsx — /contact.

   One place for enquiries to land. Before this, the footer gave
   hello@atreoxai.com, the legal pages gave a personal Gmail (fixed
   2026-08-27), and customers wrote to whatever they found — one to a
   personal address, one waiting for a reply in Discord.

   Posts to api/contact.js, which emails the enquiry and stores nothing.

   Turnstile is loaded only when this page mounts, not from index.html:
   a visitor reading a guide should not be fetching a spam-check widget
   they will never interact with. It sets no cookies, which is what
   keeps the site free of a consent banner — see the analytics note in
   legal/drafts/privacy-policy.md section 9.
══════════════════════════════════════════════════════════════════ */

const React = window.React;
const { useState, useEffect, useRef } = React;
const { PageHero, PageSection, Pill, FooterBar, CrossLinks, MONO, ArrowUpRight } = window;

const ACCENT = window.ACCENT;
const ACCENT_RGB = window.ACCENT_RGB;

/* Public by design — Turnstile site keys are meant to be in the page.
   The matching secret lives only in the TURNSTILE_SECRET_KEY environment
   variable on Vercel. Replace with the real key from the Cloudflare
   dashboard; until then the widget renders an error and the form cannot
   be submitted, which is the correct failure. */
const TURNSTILE_SITE_KEY = window.TURNSTILE_SITE_KEY || '';
const TURNSTILE_CONFIGURED = /^[A-Za-z0-9_-]{8,}$/.test(TURNSTILE_SITE_KEY);

/* Must match api/contact.js. */
const HONEYPOT_FIELD = 'company_website';

const TOPICS = [
  ['billing', 'Billing'],
  ['technical', 'Technical'],
  ['refund', 'Refund'],
  ['other', 'Other'],
];

const labelStyle = {
  display: 'block',
  fontFamily: MONO, fontWeight: 500, fontSize: '0.64rem',
  letterSpacing: '0.11em', textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.45)', marginBottom: 8,
};

const fieldStyle = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 3, padding: '12px 14px',
  fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.92rem',
  color: 'white', outline: 'none',
  transition: 'border-color 0.2s',
};

function Field({ id, label, error, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <label htmlFor={id} style={labelStyle}>{label}</label>
      {children}
      {error && (
        <p role="alert" style={{
          fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.78rem',
          color: '#ff8a7a', marginTop: 7,
        }}>{error}</p>
      )}
    </div>
  );
}

function useTurnstile(containerRef, onToken) {
  useEffect(() => {
    let widgetId = null;
    let cancelled = false;

    function render() {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      widgetId = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'dark',
        callback: token => onToken(token),
        // A token is single-use and expires. Clearing it on both paths
        // means a stale token is never posted — the form asks the visitor
        // to solve it again instead of failing at the server with an
        // error they cannot act on.
        'expired-callback': () => onToken(''),
        'error-callback': () => onToken(''),
      });
    }

    if (window.turnstile) {
      render();
    } else if (!document.getElementById('cf-turnstile-script')) {
      const s = document.createElement('script');
      s.id = 'cf-turnstile-script';
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.defer = true;
      s.onload = render;
      document.head.appendChild(s);
    } else {
      document.getElementById('cf-turnstile-script').addEventListener('load', render);
    }

    return () => {
      cancelled = true;
      if (widgetId !== null && window.turnstile) {
        try { window.turnstile.remove(widgetId); } catch (e) { /* already gone */ }
      }
    };
  }, []);
}

function ContactForm() {
  const [values, setValues] = useState({ name: '', email: '', topic: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');   // idle | sending | sent | error
  const [serverError, setServerError] = useState('');
  const [token, setToken] = useState('');
  const mountedAt = useRef(Date.now());
  const turnstileRef = useRef(null);
  const honeypotRef = useRef(null);

  useTurnstile(turnstileRef, setToken);

  function set(field, value) {
    setValues(v => ({ ...v, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }));
  }

  function validate() {
    const next = {};
    if (!values.name.trim()) next.name = 'Please tell us your name.';
    if (!values.email.trim()) next.email = 'We need an address to reply to.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
      next.email = "That address doesn't look right.";
    }
    if (!values.topic) next.topic = 'Pick the closest one.';
    if (!values.message.trim()) next.message = 'Tell us what you need.';
    return next;
  }

  async function submit(e) {
    e.preventDefault();
    setServerError('');
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;
    if (!token) {
      setServerError('Please complete the human check below.');
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          turnstileToken: token,
          [HONEYPOT_FIELD]: honeypotRef.current ? honeypotRef.current.value : '',
          elapsedSeconds: (Date.now() - mountedAt.current) / 1000,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('error');
        setServerError(data.error || 'Something went wrong. Please try again.');
        // The token is spent whether or not the send succeeded.
        if (window.turnstile) { try { window.turnstile.reset(); } catch (err) { /* noop */ } }
        setToken('');
        return;
      }
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setServerError('Could not reach the server. Please email hello@atreoxai.com.');
    }
  }

  if (status === 'sent') {
    return (
      <div className="panel" style={{ padding: '40px 32px', textAlign: 'center' }}>
        <p style={{
          fontFamily: MONO, fontWeight: 500, fontSize: '0.66rem', letterSpacing: '0.12em',
          textTransform: 'uppercase', color: ACCENT, marginBottom: 12,
        }}>Message sent</p>
        <p style={{
          fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.95rem',
          color: 'rgba(255,255,255,0.62)', lineHeight: 1.7, maxWidth: 460, margin: '0 auto',
        }}>
          Thanks — we've got it. We answer Mon–Fri, 08:00–20:00 CET; anything
          that arrives over the weekend is answered on Monday.
        </p>
      </div>
    );
  }

  const busy = status === 'sending';

  return (
    <form onSubmit={submit} noValidate>
      {/* Hidden from people and from screen readers; visible to a bot
          reading the DOM. tabIndex -1 keeps it out of keyboard order so
          nobody can land in it by accident and get silently dropped. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor={HONEYPOT_FIELD}>Company website</label>
        {/* carries contact-field with the real ones — it can never be
            focused, so nothing zooms on it, but a honeypot that is the
            only field in the form styled differently is a honeypot
            worth telling apart */}
        <input ref={honeypotRef} id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} className="contact-field"
          type="text" tabIndex="-1" autoComplete="off" defaultValue="" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0 20px' }}>
        <Field id="contact-name" label="Your name" error={errors.name}>
          <input id="contact-name" name="name" type="text" className="contact-field" style={fieldStyle}
            value={values.name} onChange={e => set('name', e.target.value)}
            maxLength={100} disabled={busy} autoComplete="name" />
        </Field>
        <Field id="contact-email" label="Email" error={errors.email}>
          <input id="contact-email" name="email" type="email" className="contact-field" style={fieldStyle}
            value={values.email} onChange={e => set('email', e.target.value)}
            maxLength={200} disabled={busy} autoComplete="email" />
        </Field>
      </div>

      <Field id="contact-topic" label="What is this about?" error={errors.topic}>
        <select id="contact-topic" name="topic" className="contact-field"
          style={{ ...fieldStyle, appearance: 'none', cursor: 'pointer' }}
          value={values.topic} onChange={e => set('topic', e.target.value)} disabled={busy}>
          <option value="" style={{ background: '#0b0b0d' }}>Choose one…</option>
          {TOPICS.map(([id, label]) => (
            <option key={id} value={id} style={{ background: '#0b0b0d' }}>{label}</option>
          ))}
        </select>
      </Field>

      <Field id="contact-message" label="Message" error={errors.message}>
        <textarea id="contact-message" name="message" rows={7} className="contact-field"
          style={{ ...fieldStyle, resize: 'vertical', minHeight: 150, lineHeight: 1.6 }}
          value={values.message} onChange={e => set('message', e.target.value)}
          maxLength={5000} disabled={busy} />
      </Field>

      <div ref={turnstileRef} style={{ marginBottom: 20, minHeight: 65 }} />

      {serverError && (
        <p role="alert" style={{
          fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.85rem',
          color: '#ff8a7a', marginBottom: 16,
        }}>{serverError}</p>
      )}

      <button type="submit" className="btn-solid" disabled={busy}
        style={{ display: 'inline-flex', opacity: busy ? 0.6 : 1, cursor: busy ? 'default' : 'pointer' }}>
        {busy ? 'Sending…' : 'Send message'} <ArrowUpRight size={14} />
      </button>

      <p style={{
        fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.78rem',
        color: 'rgba(255,255,255,0.35)', marginTop: 18, lineHeight: 1.6,
      }}>
        We use what you send only to answer you. Nothing from this form is stored
        on the site — it goes straight to our inbox.
      </p>
    </form>
  );
}

/* Until the Turnstile site key is set, the form cannot be submitted -
   the server refuses anything without a verified token, correctly. Render
   the address instead of a widget stuck on an error: a visibly broken
   contact form is worse than none, and this way the page can ship before
   the keys exist and starts working the moment they do, with no second
   deploy. */
function ContactFallback() {
  return (
    <div className="panel" style={{ padding: '34px 30px', textAlign: 'center' }}>
      <p style={{
        fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.95rem',
        color: 'rgba(255,255,255,0.62)', lineHeight: 1.7, maxWidth: 470, margin: '0 auto 20px',
      }}>
        Email us and it reaches the same place.
      </p>
      <a href="mailto:hello@atreoxai.com" className="btn-solid" style={{ display: 'inline-flex' }}>
        hello@atreoxai.com <ArrowUpRight size={14} />
      </a>
    </div>
  );
}

function ContactPage({ setPage }) {
  return (
    <div>
      <PageHero
        badge="Contact"
        title="Tell us what you need."
        sub="One form, one inbox. Billing, something broken, a refund, or anything else."
      />

      <PageSection style={{ paddingBottom: 40 }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <Pill dot>Get in touch</Pill>
          <div style={{ marginTop: 26 }}>
            {TURNSTILE_CONFIGURED ? <ContactForm /> : <ContactFallback />}
          </div>

          <p className="g-note" style={{ marginTop: 32 }}>
            Prefer email? <a href="mailto:hello@atreoxai.com" style={{ color: ACCENT, textDecoration: 'none' }}>hello@atreoxai.com</a> reaches
            the same place. Mon–Fri, 08:00–20:00 CET — weekend messages are answered Monday.
          </p>
        </div>
      </PageSection>

      <CrossLinks current="contact" setPage={setPage} />
      <div style={{ padding: '0 5% 64px' }}><FooterBar setPage={setPage} /></div>
    </div>
  );
}

Object.assign(window, { ContactPage });
