/* ══════════════════════════════════════════════════════════════════
   tool-checker.jsx — the interactive PUBLIC checkers.

   These are the working tools themselves, run on the site with no
   account: paste a proxy (or drop a .session) and get the full result,
   three times an hour per IP. The wall — hit exactly when someone has a
   batch — is the funnel, so the limit screen is designed as an invitation
   into the panel, not a refusal.

   Both talk to same-origin serverless bridges (api/tools/*.js), which
   hold the engine token and forward the call as public. Both are gated
   by Cloudflare Turnstile (the site key is injected as
   window.TURNSTILE_SITE_KEY on every page, same as the contact form) -
   the proxy checker too, because a proxy check makes our server connect
   to whatever host and port it is given, and that must not be scriptable.

   Design language is the site's: dark, technical, the cyan accent, mono
   overlines over serif headings. No score anywhere — only the facts, the
   same honesty rule the engine follows.
══════════════════════════════════════════════════════════════════ */

const React = window.React;
const { useState, useRef, useEffect, useCallback } = React;
const {
  ArrowUpRight, Check, X, Server, Globe, Shield, Zap, Cpu, Clock, Info,
  TOOL_NEXT_STEPS, proxyNextStepKey, accountNextStepKey, handoffContext,
} = window;
const ACCENT = window.ACCENT;
const ACCENT_RGB = window.ACCENT_RGB;
const MONO = window.MONO;
const SERIF = window.SERIF;
const BODY = 'Barlow, sans-serif';

const ROSE = '#fb7185';
const AMBER = '#fcd34d';

/* ── shared bits ──────────────────────────────────────────────────── */

function label(text) {
  return {
    fontFamily: MONO, fontWeight: 500, fontSize: '0.58rem',
    letterSpacing: '0.18em', textTransform: 'uppercase',
    color: `rgba(${ACCENT_RGB},0.7)`,
  };
}

function Field({ id, label: lbl, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <label htmlFor={id} style={label()}>{lbl}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(0,0,0,0.35)',
  border: '1px solid var(--g-14)', borderRadius: 4,
  padding: '11px 13px', color: 'white',
  fontFamily: MONO, fontSize: '0.85rem', outline: 'none',
  transition: 'border-color 0.15s ease',
};

function TextInput(props) {
  return (
    <input
      {...props}
      className="tool-field"
      style={inputStyle}
      onFocus={(e) => { e.target.style.borderColor = `rgba(${ACCENT_RGB},0.55)`; props.onFocus?.(e); }}
      onBlur={(e) => { e.target.style.borderColor = 'var(--g-14)'; props.onBlur?.(e); }}
    />
  );
}

function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button type="button" className="tool-btn" onClick={onClick} disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 9,
        border: `1px solid rgba(${ACCENT_RGB},${disabled ? 0.2 : 0.5})`,
        background: `rgba(${ACCENT_RGB},${disabled ? 0.04 : 0.12})`,
        boxShadow: disabled ? 'none' : `0 0 18px rgba(${ACCENT_RGB},0.16)`,
        borderRadius: 3, padding: '12px 22px',
        fontFamily: MONO, fontWeight: 600, fontSize: '0.66rem',
        letterSpacing: '0.18em', textTransform: 'uppercase',
        color: disabled ? `rgba(255,255,255,0.35)` : ACCENT,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s ease',
      }}>
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <span aria-hidden="true" style={{
      width: 13, height: 13, borderRadius: '50%',
      border: `2px solid rgba(${ACCENT_RGB},0.3)`, borderTopColor: ACCENT,
      display: 'inline-block', animation: 'spin 0.7s linear infinite',
    }} />
  );
}

function StatTile({ label: lbl, value, tone, hint }) {
  const color = tone === 'bad' ? ROSE : tone === 'warn' ? AMBER : 'white';
  return (
    <div title={hint} className="panel" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontFamily: MONO, fontSize: '1.15rem', fontWeight: 600, color, lineHeight: 1.1 }}>{value}</span>
      <span style={{ fontFamily: MONO, fontSize: '0.54rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>{lbl}</span>
    </div>
  );
}

function VerdictPill({ ok, warn, children }) {
  const color = ok ? ACCENT : warn ? AMBER : ROSE;
  const rgb = ok ? ACCENT_RGB : warn ? '252,211,77' : '251,113,133';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      border: `1px solid rgba(${rgb},0.4)`, background: `rgba(${rgb},0.1)`,
      borderRadius: 3, padding: '9px 15px',
      fontFamily: MONO, fontWeight: 600, fontSize: '0.62rem',
      letterSpacing: '0.16em', textTransform: 'uppercase', color,
    }}>
      {ok ? <Check size={13} /> : warn ? <Info size={13} /> : <X size={13} />}
      {children}
    </span>
  );
}

function StageRow({ icon: Icon, name, ok, detail, message }) {
  return (
    <div style={{ display: 'flex', gap: 13, padding: '14px 0', borderBottom: '1px solid var(--g-14)' }}>
      <span style={{
        marginTop: 2, width: 22, height: 22, flexShrink: 0, borderRadius: 3,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: ok ? `rgba(${ACCENT_RGB},0.14)` : 'rgba(251,113,133,0.14)',
        color: ok ? ACCENT : ROSE,
      }}>{ok ? <Check size={13} /> : <X size={13} />}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '4px 12px' }}>
          <span style={{ ...label(), color: 'rgba(255,255,255,0.55)', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <Icon size={12} /> {name}
          </span>
          {detail && <span style={{ fontFamily: BODY, fontSize: '0.9rem', color: 'white' }}>{detail}</span>}
        </div>
        {message && <span style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.86rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{message}</span>}
      </div>
    </div>
  );
}

/* ── What this visitor has already checked this hour ──────────────────
   For the limit screen to say "you checked 7 proxies in 3 checks" rather
   than only "limit reached". Kept in sessionStorage in this tab and nowhere
   else: it is a courtesy to the visitor, not a record of them, and it goes
   when the tab does. Counts only - no proxy, no file name. */
const USAGE_KEY = 'atreox.toolUse.';
function noteToolUse(tool, units) {
  try {
    const now = Date.now();
    const list = JSON.parse(sessionStorage.getItem(USAGE_KEY + tool) || '[]')
      .filter((e) => now - e.t < 3600 * 1000);
    list.push({ t: now, units: Math.max(0, units | 0) });
    sessionStorage.setItem(USAGE_KEY + tool, JSON.stringify(list));
  } catch { /* storage unavailable: the limit screen just says less */ }
}
function toolUseThisHour(tool) {
  try {
    const now = Date.now();
    const list = JSON.parse(sessionStorage.getItem(USAGE_KEY + tool) || '[]')
      .filter((e) => now - e.t < 3600 * 1000);
    return { checks: list.length, units: list.reduce((n, e) => n + e.units, 0) };
  } catch {
    return { checks: 0, units: 0 };
  }
}

/* The most important screen: the wall reads as an invitation.

   AND IT HAS TO INVITE SOMEWHERE THE VISITOR CAN GO. This button pointed
   at the panel, which is behind Clerk: whoever hit this wall hit it
   because they had a batch in front of them and had just spent three
   checks proving it, and we answered the most buying-intent moment on the
   site with a sign-in form for an account they do not have. It goes to
   /pricing now — the page that answers "what does the unlimited version
   cost", which is the question the wall just put in their head.

   A plain anchor, not a setPage() interception. Three widgets render this
   screen across two pages and none of them is handed the router, so
   threading it here would be five components' worth of prop for a click
   whose whole purpose is to leave the tool. A real navigation to a real
   prerendered page is also what a middle-click and a crawler want. */
function LimitScreen({ retryMinutes, tool }) {
  const used = toolUseThisHour(tool);
  const noun = tool === 'account' ? 'account' : 'proxy';
  const plural = (n) => (n === 1 ? noun : tool === 'account' ? 'accounts' : 'proxies');
  return (
    <div className="panel ticks" style={{ padding: '36px 30px', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <span style={{ ...label(), color: `rgba(${ACCENT_RGB},0.75)` }}>Free limit reached</span>
      <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '1.6rem', color: 'white', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
        That’s your 3 free {tool} checks this hour.
      </span>
      {/* How much they got through, when this tab knows. The wall is hit by
          somebody with volume, and saying the volume back is what makes the
          next sentence about the panel relevant rather than a pitch. */}
      {used.units > 0 && (
        <span style={{ fontFamily: MONO, fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>
          You checked {used.units} {plural(used.units)} in {used.checks} {used.checks === 1 ? 'check' : 'checks'} from this tab.
        </span>
      )}
      <span style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.98rem', color: 'rgba(255,255,255,0.62)', lineHeight: 1.75, maxWidth: 540 }}>
        The free {tool} checker allows 3 checks an hour{tool === 'account' ? ', one account each' : ', up to 3 proxies each'}.
        The same checker in the panel has no hourly limit — run a whole list at once and keep a
        history for every proxy and account. Included with any ATREOX module.
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', marginTop: 4 }}>
        <a href="/pricing" style={{
          display: 'inline-flex', alignItems: 'center', gap: 9,
          border: `1px solid rgba(${ACCENT_RGB},0.5)`, background: `rgba(${ACCENT_RGB},0.12)`,
          boxShadow: `0 0 18px rgba(${ACCENT_RGB},0.16)`, borderRadius: 3, padding: '12px 22px',
          textDecoration: 'none', fontFamily: MONO, fontWeight: 600, fontSize: '0.66rem',
          letterSpacing: '0.18em', textTransform: 'uppercase', color: ACCENT,
        }}>See what’s included <ArrowUpRight size={14} /></a>
        {retryMinutes != null && (
          <span style={{ fontFamily: MONO, fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <Clock size={12} /> resets in ~{retryMinutes} min
          </span>
        )}
      </div>
    </div>
  );
}

/* Parse an engine/bridge error into {kind, retryMinutes, message}. */
async function readError(res) {
  let body = {};
  try { body = await res.json(); } catch { /* non-json */ }
  const detail = body && typeof body.detail === 'object' ? body.detail : null;
  const message = (detail && detail.message) || (typeof body.detail === 'string' ? body.detail : null) || 'The check could not be run.';
  if (res.status === 429 && detail && detail.limit === 'public_hourly') {
    const mins = detail.retry_after ? Math.max(1, Math.round(detail.retry_after / 60)) : null;
    return { kind: 'limit', retryMinutes: mins, message };
  }
  if (res.status === 429) return { kind: 'busy', message };
  return { kind: 'error', message };
}

/* ══ AFTER A BAD VERDICT ════════════════════════════════════════════

   What the verdict means, what people do about it, where to read more -
   from TOOL_NEXT_STEPS (tool-next-steps.jsx). And one optional way to talk
   to a person about it.

   ONE CAPTURE METHOD, AND WHY IT IS A TELEGRAM USERNAME. The people who use
   these checkers live in Telegram; an e-mail address is a second channel we
   would have to run and they would have to check. So the form asks for an
   @username, says exactly what happens with it, and sends it - with the
   verdict and nothing else - to our inbox through the same function family
   as the contact form. Nothing is stored and nothing is subscribed. A
   person replies once, about this result.

   Turnstile loads only when somebody opens the form, so reading a verdict
   costs no third-party request. */
function useLazyTurnstile(enabled) {
  const ref = useRef(null);
  const [token, setToken] = useState('');
  const siteKey = (typeof window !== 'undefined' && window.TURNSTILE_SITE_KEY) || '';
  const configured = /^[A-Za-z0-9_-]{8,}$/.test(siteKey);
  useEffect(() => {
    if (!enabled || !configured) return;
    let widgetId;
    let cancelled = false;
    const render = () => {
      if (cancelled || !ref.current || !window.turnstile) return;
      widgetId = window.turnstile.render(ref.current, {
        sitekey: siteKey, theme: 'dark',
        // under 300px (a 320px phone) the standard 300px widget would
        // push the page sideways; the compact one is 150px wide
        size: ref.current.offsetWidth < 300 ? 'compact' : 'normal',
        callback: (t) => setToken(t),
        'expired-callback': () => setToken(''),
        'error-callback': () => setToken(''),
      });
    };
    if (window.turnstile) render();
    else if (!document.getElementById('cf-turnstile-script')) {
      const sc = document.createElement('script');
      sc.id = 'cf-turnstile-script';
      sc.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      sc.async = true; sc.defer = true; sc.onload = render;
      document.head.appendChild(sc);
    } else {
      const iv = setInterval(() => { if (window.turnstile) { clearInterval(iv); render(); } }, 100);
      setTimeout(() => clearInterval(iv), 8000);
    }
    return () => { cancelled = true; try { if (widgetId && window.turnstile) window.turnstile.remove(widgetId); } catch { /* */ } };
  }, [enabled, configured, siteKey]);
  return { ref, token, configured };
}

const USERNAME_RE = /^@?[A-Za-z][A-Za-z0-9_]{4,31}$/;

function HandoffForm({ context }) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [state, setState] = useState({ status: 'idle' }); // idle|sending|sent|error
  const { ref, token, configured } = useLazyTurnstile(open);
  const valid = USERNAME_RE.test(username.trim());

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        style={{ alignSelf: 'flex-start', background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          fontFamily: BODY, fontSize: '0.9rem', color: ACCENT, textDecoration: 'underline', textUnderlineOffset: 3 }}>
        Not sure what to do with this? Ask a person on Telegram
      </button>
    );
  }
  if (state.status === 'sent') {
    return (
      <span style={{ fontFamily: BODY, fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
        Sent. Someone from ATREOX will message {username.trim().replace(/^@?/, '@')} on Telegram about this result.
        If your privacy settings block messages from people you have not talked to, write to us first.
      </span>
    );
  }

  async function send() {
    if (!valid) return;
    if (configured && !token) { setState({ status: 'error', message: 'Please complete the verification first.' }); return; }
    setState({ status: 'sending' });
    try {
      const res = await fetch('/api/tools/handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Turnstile-Token': token },
        body: JSON.stringify({ username: username.trim(), ...context }),
      });
      if (!res.ok) {
        const e = await readError(res);
        setState({ status: 'error', message: e.message });
        return;
      }
      setState({ status: 'sent' });
    } catch {
      setState({ status: 'error', message: 'Could not send. Try again.' });
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--g-14)', paddingTop: 16 }}>
      <span style={{ fontFamily: BODY, fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65 }}>
        Leave your Telegram username and a person from ATREOX will message you once, about this result.
        We receive your username and the verdict shown above — not the proxy, its login, or any file.
        Nothing is stored and you are not added to any list.
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <div style={{ flex: '1 1 220px', maxWidth: 320, minWidth: 0 }}>
          <TextInput value={username} placeholder="@yourusername" autoComplete="off" aria-label="Telegram username"
            onChange={(e) => setUsername(e.target.value)} />
        </div>
        <PrimaryButton onClick={send} disabled={!valid || state.status === 'sending'}>
          {state.status === 'sending' ? <><Spinner /> Sending…</> : 'Send'}
        </PrimaryButton>
      </div>
      {configured && <div ref={ref} style={{ minHeight: 65 }} />}
      {state.status === 'error' && <span style={{ fontFamily: BODY, fontSize: '0.86rem', color: ROSE }}>{state.message}</span>}
    </div>
  );
}

function NextStep({ tool, stepKey, result, count }) {
  const step = stepKey && TOOL_NEXT_STEPS && TOOL_NEXT_STEPS[tool] && TOOL_NEXT_STEPS[tool][stepKey];
  if (!step) return null;
  return (
    <div className="panel" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14, borderColor: 'rgba(252,211,77,0.3)' }}>
      <span style={{ ...label(), color: AMBER }}>What this means{count > 1 ? ` · ${count} results like this` : ''}</span>
      <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '1.3rem', color: 'white', lineHeight: 1.25 }}>{step.title}</span>
      <span style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.7 }}>{step.means}</span>
      <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {step.doing.map((d) => (
          <li key={d} style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{d}</li>
        ))}
      </ul>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px' }}>
        {step.links.map((l) => (
          <a key={l.href} href={l.href} className="quiet-link">{l.label} <ArrowUpRight size={12} /></a>
        ))}
      </div>
      <HandoffForm context={handoffContext(tool, stepKey, result)} />
    </div>
  );
}

/* ══ PROXY CHECKER ══════════════════════════════════════════════════ */

/* The connection-type label is NOT defined here any more. It was one of five
   places wording the same value, and the word it printed for the commonest
   case - 'Residential' - claimed something no database in this system holds:
   GeoLite2 carries the operator, not the access technology, so a mobile proxy
   and a home line on one carrier are indistinguishable to us. A visitor
   checking proxies sold as mobile read 'Residential' and had every reason to
   think the seller lied. The engine now sends the sentence as ip.type_label. */
const REGION = (typeof Intl !== 'undefined' && Intl.DisplayNames) ? new Intl.DisplayNames(['en'], { type: 'region' }) : null;
function country(code) { if (!code) return null; try { return REGION ? REGION.of(code) : code; } catch { return code; } }
function ms(v) { return v == null ? '—' : `${Math.round(v)} ms`; }

/* ── The proxy verdict, in four answers rather than two ──────────────
   PORTED, NOT SHARED, and that is a compromise worth naming. The panel
   holds the same rules in lib/proxy-verdict.ts; this is a separate
   repository with no build step that could import from it, and a
   published package for three functions would be worse than the
   duplication. So the two are kept honest by a check instead:
   scripts/verify-proxy-verdict-parity.mjs reads BOTH files and fails
   if the four headlines or the tone rule drift apart.

   Why four and not two. "Works / Not usable" collapsed three unrelated
   situations into one red word: we never reached the proxy, we reached
   it and TELEGRAM refused, and our own check crashed. The third is the
   one that cost real trust - a string was passed where python_socks
   wanted an enum, every socks5 check failed at stage one, and every one
   of those failures was shown to a visitor as "your proxy does not
   work", about working hardware. It is amber now and says whose fault
   it is. ── */
const PROXY_VERDICT = {
  ok: { text: 'Works with Telegram', tone: 'ok' },
  telegram_failed: { text: 'Proxy works, Telegram refused', tone: 'bad' },
  tcp_failed: { text: 'No connection to the proxy', tone: 'bad' },
  internal_error: { text: 'Check failed on our side', tone: 'warn' },
};

function proxyVerdict(r) {
  return PROXY_VERDICT[r.result] || PROXY_VERDICT.internal_error;
}

/* The failing stage's own sentence, which already carries the number for
   a timeout ("did not respond within 6 seconds"). */
function stageMessage(r) {
  if (r.result === 'telegram_failed') return r.telegram.message;
  if (r.result === 'tcp_failed' || r.result === 'internal_error') return r.tcp.message;
  return null;
}

/* The furthest stage that produced a number. A working Argentinian
   mobile exit sits at 1.2-1.5s to Telegram, which reads as "broken"
   with no number beside it. */
function pingLabel(r) {
  const v = r.telegram.latency_ms != null ? r.telegram.latency_ms : r.tcp.latency_ms;
  if (v == null) return '—';
  return v >= 1000 ? `${(v / 1000).toFixed(1)} s` : `${Math.round(v)} ms`;
}

function ProxyResult({ r }) {
  const tg = country(r.telegram.country);
  const ip = country(r.ip.country);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
        <VerdictPill ok={proxyVerdict(r).tone === 'ok'} warn={proxyVerdict(r).tone === 'warn'}>
          {proxyVerdict(r).text}
        </VerdictPill>
        <span style={{ fontFamily: BODY, fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)' }}>
          {new Date(r.checked_at).toLocaleString()}
        </span>
      </div>
      {stageMessage(r) && (
        <span style={{ fontFamily: BODY, fontSize: '0.9rem', color: 'rgba(255,255,255,0.62)', lineHeight: 1.6 }}>
          {stageMessage(r)}
        </span>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
        <StatTile label="Ping" value={pingLabel(r)} />
        <StatTile label="TCP" value={ms(r.tcp.latency_ms)} />
        <StatTile label="Telegram sees" value={r.telegram.country || '—'} hint={tg || undefined} />
        <StatTile label="Nearest DC" value={r.telegram.nearest_dc == null ? '—' : `DC${r.telegram.nearest_dc}`} />
      </div>
      {r.warnings && r.warnings.length > 0 && (
        <div className="panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 11 }}>
          {r.warnings.map((w) => (
            <div key={w.code} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
              <span style={{ color: AMBER, marginTop: 1 }}><Info size={14} /></span>
              <span style={{ fontFamily: BODY, fontSize: '0.88rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.6 }}>{w.message}</span>
            </div>
          ))}
        </div>
      )}
      <div className="panel" style={{ padding: '4px 22px 6px' }}>
        <StageRow icon={Zap} name="Connection" ok={r.tcp.ok} detail={r.tcp.ok ? ms(r.tcp.latency_ms) : null} message={r.tcp.message} />
        <StageRow icon={Server} name="Telegram" ok={r.telegram.ok}
          detail={r.telegram.ok ? [tg, r.telegram.nearest_dc == null ? null : `nearest DC${r.telegram.nearest_dc}`, ms(r.telegram.latency_ms)].filter(Boolean).join(' · ') : null}
          message={r.telegram.message} />
        <StageRow icon={Globe} name="Exit IP" ok={r.ip.ok}
          detail={r.ip.ok ? [r.ip.address, ip, r.ip.type_label, r.ip.asn == null ? null : `AS${r.ip.asn}`].filter(Boolean).join(' · ') : null}
          message={r.ip.ok ? r.ip.as_org : r.ip.message} />
        {/* Read off the login and port, not measured: one check samples the
            exit once and cannot see it move. "unknown" is a provider we have
            no rule for and is shown as that, never as a pass. Absent (older
            engine, or MTProto) renders nothing. */}
        {r.exit_held && r.exit_held !== 'unknown' && (
          <StageRow icon={Shield} name="Holds its exit" ok={r.exit_held === 'pinned'}
            detail={r.exit_held === 'pinned' ? 'Yes' : 'No'}
            message={r.exit_held_detail} />
        )}
        {r.exit_held === 'unknown' && (
          <StageRow icon={Info} name="Holds its exit" ok={false}
            detail="Cannot tell for this provider" message={r.exit_held_detail} />
        )}
      </div>
    </div>
  );
}

/* ── The paste box ─────────────────────────────────────────────────
   Nobody buys one proxy. A visitor arrives from search with the block of
   lines their provider e-mailed them, and a form that accepts exactly one of
   them makes them do arithmetic on their own purchase before it will answer a
   question.

   THREE LINES PER CHECK, AND THE THREE COST ONE CHECK, not three. Charging
   per line would have been the cautious-looking choice and the wrong one: it
   prices the tool so that using it properly — comparing three proxies from
   the same purchase — exhausts the whole free allowance in a single click,
   which is a worse first impression than no free tool at all.

   NOTHING HERE PARSES A PROXY LINE. The lines go to the engine exactly as
   typed, and src/proxy_parser.py is the only thing in the system that knows
   what a proxy line looks like. A copy of that grammar in this file is
   precisely the kind of second opinion that cost a week: a string where a
   ProxyType belonged, in the one call site that did not use the shared map,
   and every working SOCKS5 proxy reported dead by a fully green test suite.
   Splitting on newlines is not a grammar; splitting on ":" to find a host and
   a port is, and it does not happen here.
*/
const BATCH_MAX_LINES = 3;

function ProxyBatchWidget() {
  const [text, setText] = useState('');
  const [state, setState] = useState({ status: 'idle' });
  const { ref: turnstileRef, token, configured, reset: resetTurnstile } = useTurnstile();

  // Splitting a textarea on newlines. This is the ONLY thing this file does
  // to a proxy line - trim() also disposes of the \r a Windows paste brings.
  // Everything past this point is the engine's parser's business.
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const tooMany = lines.length > BATCH_MAX_LINES;
  const canSubmit = lines.length > 0 && !tooMany;
  // Without a site key there is no widget to wait for: the request goes out
  // with no token and the bridge answers with its own message, the same way
  // the account checker degrades.
  const needsToken = configured && !token;

  async function submit() {
    if (!canSubmit || needsToken) return;
    setState({ status: 'loading' });
    try {
      // The whole batch is one POST, so it carries one token.
      const res = await fetch('/api/tools/proxy-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Turnstile-Token': token },
        body: JSON.stringify({ lines }),
      });
      if (!res.ok) {
        const e = await readError(res);
        setState(e.kind === 'limit'
          ? { status: 'limit', retryMinutes: e.retryMinutes }
          : { status: 'error', message: e.message });
        return;
      }
      const batch = await res.json();
      noteToolUse('proxy', batch.checked);
      setState({ status: 'result', batch });
    } catch {
      setState({ status: 'error', message: 'Could not reach the checker. Try again.' });
    } finally {
      resetTurnstile();
    }
  }

  /* The batch gets ONE next step - for the first line with a problem - and
     says how many lines share it, rather than repeating the same panel
     three times. */
  const batchKeys = state.status === 'result'
    ? state.batch.items.filter((i) => i.result).map((i) => ({ key: proxyNextStepKey(i.result), r: i.result })).filter((x) => x.key)
    : [];
  const firstBad = batchKeys[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="panel" style={{ padding: '26px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field id="pb-lines" label={`Paste up to ${BATCH_MAX_LINES} proxies, one per line`}>
          <textarea
            id="pb-lines"
            className="tool-field"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            spellCheck={false}
            autoComplete="off"
            placeholder={['gw.dataimpulse.com:10000:user:pass', 'socks5://user:pass@1.2.3.4:1080', '1.2.3.4:8080'].join(String.fromCharCode(10))}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, fontFamily: MONO, minHeight: 96 }}
          />
        </Field>

        {configured && <div ref={turnstileRef} style={{ minHeight: 65 }} />}

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
          <PrimaryButton onClick={submit} disabled={!canSubmit || needsToken || state.status === 'loading'}>
            {state.status === 'loading'
              ? <><Spinner /> Checking {lines.length}…</>
              : `Check ${lines.length || ''} ${lines.length === 1 ? 'proxy' : 'proxies'}`.replace('  ', ' ')}
          </PrimaryButton>
          <span style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.85rem', color: tooMany ? ROSE : 'rgba(255,255,255,0.5)' }}>
            {tooMany
              ? `That is ${lines.length} lines. Check ${BATCH_MAX_LINES} at a time.`
              : state.status === 'loading'
                ? 'Each one connects, then asks Telegram — up to half a minute apiece.'
                : needsToken
                  ? 'Complete the verification above to check.'
                  : `All ${BATCH_MAX_LINES} count as one of your free checks. Format is auto-detected.`}
          </span>
        </div>

        {/* Said here rather than only in the results, because it is the
            reason somebody pastes three instead of checking one and giving
            up. */}
        <p style={{ margin: 0, fontFamily: BODY, fontWeight: 300, fontSize: '0.84rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.45)' }}>
          MTProto proxies have no agreed one-line format — check those one at a
          time above. Nothing about any proxy is stored.
        </p>

        {state.status === 'error' && (
          <span style={{ fontFamily: BODY, fontSize: '0.86rem', color: ROSE }}>{state.message}</span>
        )}
      </div>

      {state.status === 'limit' && <LimitScreen retryMinutes={state.retryMinutes} tool="proxy" />}
      {state.status === 'result' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {state.batch.items.map((item) => (
            <div key={item.line_number} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: MONO, fontSize: '0.72rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>
                  LINE {item.line_number}
                </span>
                {item.label && (
                  <span style={{ fontFamily: MONO, fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>
                    {item.label}
                  </span>
                )}
              </div>
              {/* A line that did not parse is an ANSWER, not an error: the
                  other two still got verdicts, and the message says which
                  shapes are accepted rather than "invalid input". */}
              {item.parse_error ? (
                <div className="panel" style={{ padding: '16px 18px', fontFamily: BODY, fontWeight: 300, fontSize: '0.88rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.62)' }}>
                  Could not read this line — {item.parse_error}
                </div>
              ) : (
                <ProxyResult r={item.result} />
              )}
            </div>
          ))}
          {state.batch.checked < state.batch.items.length && (
            <p style={{ margin: 0, fontFamily: BODY, fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)' }}>
              {state.batch.items.length - state.batch.checked} line
              {state.batch.items.length - state.batch.checked === 1 ? '' : 's'} could not be read, so
              {' '}{state.batch.checked} {state.batch.checked === 1 ? 'proxy was' : 'proxies were'} actually checked.
              A line we could not read did not cost you anything extra.
            </p>
          )}
          {firstBad && (
            <NextStep tool="proxy" stepKey={firstBad.key} result={firstBad.r}
              count={batchKeys.filter((x) => x.key === firstBad.key).length} />
          )}
        </div>
      )}
    </div>
  );
}

function ProxyCheckerWidget() {
  const [type, setType] = useState('socks5');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secret, setSecret] = useState('');
  const [state, setState] = useState({ status: 'idle' }); // idle|loading|result|limit|error
  const { ref: turnstileRef, token, configured, reset: resetTurnstile } = useTurnstile();
  const isMt = type === 'mtproto';

  const portNum = Number(port);
  const canSubmit = host.trim() && Number.isInteger(portNum) && portNum >= 1 && portNum <= 65535 && (!isMt || secret.trim());
  const needsToken = configured && !token;

  async function submit() {
    if (!canSubmit || needsToken) return;
    setState({ status: 'loading' });
    const payload = { type, host: host.trim(), port: portNum };
    if (isMt) payload.secret = secret.trim();
    else { if (username.trim()) payload.username = username.trim(); if (password) payload.password = password; }
    try {
      const res = await fetch('/api/tools/proxy-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Turnstile-Token': token },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const e = await readError(res);
        setState(e.kind === 'limit' ? { status: 'limit', retryMinutes: e.retryMinutes } : { status: 'error', message: e.message });
        return;
      }
      const result = await res.json();
      noteToolUse('proxy', 1);
      setState({ status: 'result', result });
    } catch {
      setState({ status: 'error', message: 'Could not reach the checker. Try again.' });
    } finally {
      resetTurnstile();
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="panel" style={{ padding: '26px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="tool-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
          <Field id="pc-type" label="Type">
            <select id="pc-type" className="tool-field" value={type} onChange={(e) => setType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="socks5">SOCKS5</option>
              <option value="http">HTTP</option>
              <option value="mtproto">MTProto</option>
            </select>
          </Field>
          <div style={{ gridColumn: 'span 2', minWidth: 0 }}>
            <Field id="pc-host" label="Host">
              <TextInput id="pc-host" value={host} placeholder="1.2.3.4 or host.example" autoComplete="off"
                onChange={(e) => setHost(e.target.value)} />
            </Field>
          </div>
          <Field id="pc-port" label="Port">
            <TextInput id="pc-port" value={port} placeholder="1080" inputMode="numeric" autoComplete="off"
              onChange={(e) => setPort(e.target.value.replace(/[^0-9]/g, ''))} />
          </Field>
        </div>
        {isMt ? (
          <Field id="pc-secret" label="Secret">
            <TextInput id="pc-secret" value={secret} placeholder="hex or base64 secret" autoComplete="off"
              onChange={(e) => setSecret(e.target.value)} />
          </Field>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
            <Field id="pc-user" label="Login (optional)">
              <TextInput id="pc-user" value={username} autoComplete="off" onChange={(e) => setUsername(e.target.value)} />
            </Field>
            <Field id="pc-pass" label="Password (optional)">
              <TextInput id="pc-pass" type="password" value={password} autoComplete="off" onChange={(e) => setPassword(e.target.value)} />
            </Field>
          </div>
        )}
        {configured && <div ref={turnstileRef} style={{ minHeight: 65 }} />}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
          <PrimaryButton onClick={submit} disabled={!canSubmit || needsToken || state.status === 'loading'}>
            {state.status === 'loading' ? <><Spinner /> Checking…</> : 'Check proxy'}
          </PrimaryButton>
          <span style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
            {state.status === 'loading'
              ? 'Connecting, then asking Telegram — up to half a minute.'
              : needsToken
                ? 'Complete the verification above to check.'
                : 'No account, no session. Nothing about the proxy is stored.'}
          </span>
        </div>
        {state.status === 'error' && (
          <span style={{ fontFamily: BODY, fontSize: '0.86rem', color: ROSE }}>{state.message}</span>
        )}
      </div>
      {state.status === 'result' && <ProxyResult r={state.result} />}
      {state.status === 'result' && (
        <NextStep tool="proxy" stepKey={proxyNextStepKey(state.result)} result={state.result} />
      )}
      {state.status === 'limit' && <LimitScreen retryMinutes={state.retryMinutes} tool="proxy" />}
    </div>
  );
}

/* ══ ACCOUNT CHECKER ════════════════════════════════════════════════ */

const WRITE_LABEL = {
  ok: { t: 'Can post', ok: true },
  write_forbidden: { t: 'Write-banned', bad: true },
  frozen: { t: 'Frozen', bad: true },
  cannot_resolve: { t: 'Low trust', warn: true },
  not_available: { t: 'Write test unavailable', warn: true },
  unknown: { t: 'Unknown', warn: true },
};
const SPAM_LABEL = {
  none: 'No spam limit', limited: 'Spam-limited', not_checked: 'Not checked here', unknown: 'Unknown',
};

/* A token is single-use: siteverify accepts it once. reset() clears the
   stored token and asks the widget for a fresh one, and a caller that sends
   a token calls it after EVERY request, success or failure - otherwise the
   next check goes out with a spent token and comes back a 400. */
function useTurnstile() {
  const ref = useRef(null);
  const widgetIdRef = useRef(null);
  const [token, setToken] = useState('');
  const siteKey = (typeof window !== 'undefined' && window.TURNSTILE_SITE_KEY) || '';
  const configured = /^[A-Za-z0-9_-]{8,}$/.test(siteKey);
  const reset = useCallback(() => {
    setToken('');
    try {
      if (widgetIdRef.current != null && window.turnstile) window.turnstile.reset(widgetIdRef.current);
    } catch { /* widget already gone */ }
  }, []);
  useEffect(() => {
    if (!configured) return;
    let widgetId;
    let cancelled = false;
    const render = () => {
      if (cancelled || !ref.current || !window.turnstile) return;
      widgetId = widgetIdRef.current = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        theme: 'dark',
        size: ref.current.offsetWidth < 300 ? 'compact' : 'normal',
        callback: (t) => setToken(t),
        'expired-callback': () => setToken(''),
        'error-callback': () => setToken(''),
      });
    };
    if (window.turnstile) render();
    else if (!document.getElementById('cf-turnstile-script')) {
      const s = document.createElement('script');
      s.id = 'cf-turnstile-script';
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true; s.defer = true; s.onload = render;
      document.head.appendChild(s);
    } else {
      const iv = setInterval(() => { if (window.turnstile) { clearInterval(iv); render(); } }, 100);
      setTimeout(() => clearInterval(iv), 8000);
    }
    return () => {
      cancelled = true;
      widgetIdRef.current = null;
      try { if (widgetId && window.turnstile) window.turnstile.remove(widgetId); } catch { /* */ }
    };
  }, [configured, siteKey]);
  return { ref, token, configured, reset };
}

function AccountResult({ r }) {
  if (!r.authorized) {
    return (
      <div className="panel" style={{ padding: '22px 24px', display: 'flex', gap: 13, alignItems: 'flex-start', borderColor: 'rgba(251,113,133,0.4)' }}>
        <span style={{ color: ROSE, marginTop: 2 }}><X size={16} /></span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ ...label(), color: ROSE }}>Session not usable</span>
          <span style={{ fontFamily: BODY, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{r.write_message}</span>
        </div>
      </div>
    );
  }
  const w = WRITE_LABEL[r.write_status] || WRITE_LABEL.unknown;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
        <VerdictPill ok={w.ok} warn={w.warn}>{w.t}</VerdictPill>
        {r.is_premium && <Chip>Premium</Chip>}
        {r.is_verified && <Chip>Verified</Chip>}
        {r.flagged_scam && <Chip bad>Scam</Chip>}
        {r.flagged_fake && <Chip bad>Fake</Chip>}
        {r.flagged_restricted && <Chip bad>Restricted</Chip>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
        <StatTile label="Can post" value={w.t} tone={w.bad ? 'bad' : w.warn ? 'warn' : undefined} hint={r.write_message} />
        <StatTile label="Spam limit" value={SPAM_LABEL[r.spamblock_status] || 'Unknown'} tone={r.spamblock_status === 'limited' ? 'bad' : undefined} hint={r.spamblock_message} />
        <StatTile label="Age (approx.)" value={r.approx_age_label || '—'} hint={r.approx_created ? `≈ ${r.approx_created} · from the account ID` : 'From the account ID'} />
        <StatTile label="Data centre" value={r.dc_id ? `DC${r.dc_id}` : '—'} hint={r.dc_label} />
      </div>
      <div className="panel" style={{ padding: '4px 22px 6px' }}>
        <DetailLine icon={Cpu} name="Device" value={[r.device_model, r.device_platform, r.device_app].filter(Boolean).join(' · ') || '—'} />
        <DetailLine icon={Globe} name="Home data centre" value={r.dc_label || (r.dc_id ? `DC${r.dc_id}` : '—')} />
        <DetailLine icon={Shield} name="Active sessions" value={r.active_sessions == null ? '—' : String(r.active_sessions)} />
      </div>
      {(r.spamblock_status === 'not_checked' && r.spamblock_message) && (
        <div className="panel" style={{ padding: '16px 20px', display: 'flex', gap: 11, alignItems: 'flex-start' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', marginTop: 1 }}><Info size={14} /></span>
          <span style={{ fontFamily: BODY, fontSize: '0.86rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{r.spamblock_message}</span>
        </div>
      )}
    </div>
  );
}

function Chip({ children, bad }) {
  const rgb = bad ? '251,113,133' : ACCENT_RGB;
  const color = bad ? ROSE : `rgba(${ACCENT_RGB},0.9)`;
  return (
    <span style={{
      border: `1px solid rgba(${rgb},0.3)`, background: `rgba(${rgb},0.08)`, color,
      borderRadius: 3, padding: '5px 10px', fontFamily: MONO, fontSize: '0.56rem',
      letterSpacing: '0.14em', textTransform: 'uppercase',
    }}>{children}</span>
  );
}

function DetailLine({ icon: Icon, name, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '11px 0', borderBottom: '1px solid var(--g-14)' }}>
      <span style={{ ...label(), color: 'rgba(255,255,255,0.5)', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
        <Icon size={12} /> {name}
      </span>
      <span style={{ marginLeft: 'auto', fontFamily: BODY, fontSize: '0.88rem', color: 'white', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function AccountCheckerWidget() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [state, setState] = useState({ status: 'idle' });
  const inputRef = useRef(null);
  const { ref: turnstileRef, token, configured } = useTurnstile();

  const accept = useCallback((f) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.session')) { setState({ status: 'error', message: 'Upload a Telethon .session file.' }); return; }
    if (f.size > 2 * 1024 * 1024) { setState({ status: 'error', message: 'That file is too large to be a session.' }); return; }
    setFile(f); setState({ status: 'idle' });
  }, []);

  async function submit() {
    if (!file) return;
    if (configured && !token) { setState({ status: 'error', message: 'Please complete the verification first.' }); return; }
    setState({ status: 'loading' });
    try {
      const buf = await file.arrayBuffer();
      const res = await fetch('/api/tools/account-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream', 'X-Turnstile-Token': token },
        body: buf,
      });
      if (!res.ok) {
        const e = await readError(res);
        setState(e.kind === 'limit' ? { status: 'limit', retryMinutes: e.retryMinutes } : { status: 'error', message: e.message });
        return;
      }
      const result = await res.json();
      noteToolUse('account', 1);
      setState({ status: 'result', result });
    } catch {
      setState({ status: 'error', message: 'Could not reach the checker. Try again.' });
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Notice B (public variant), ABOVE the upload. */}
      <div className="panel" style={{ padding: '18px 20px', display: 'flex', gap: 13, alignItems: 'flex-start', borderColor: 'rgba(252,211,77,0.28)' }}>
        <span style={{ color: AMBER, marginTop: 2 }}><Shield size={16} /></span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: BODY, fontSize: '0.88rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.65 }}>
          <span style={{ color: 'white', fontWeight: 500 }}>Only check accounts you own.</span>
          <span>A session file gives full control of its account — never upload one that isn’t yours.</span>
          <span>The check runs from our server, so a new login may appear in the account’s active sessions.</span>
          <span>Your session runs this one check and is deleted the instant it finishes — never stored, never logged. We keep only anonymised facts and a one-way fingerprint.</span>
        </div>
      </div>

      <div className="panel" style={{ padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <label
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); accept(e.dataTransfer.files && e.dataTransfer.files[0]); }}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, cursor: 'pointer',
            border: `1px dashed ${dragging ? ACCENT : 'var(--g-14)'}`, borderRadius: 6,
            padding: '38px 24px', textAlign: 'center',
            background: dragging ? `rgba(${ACCENT_RGB},0.05)` : 'transparent', transition: 'all 0.15s ease',
          }}>
          <input ref={inputRef} type="file" accept=".session" style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
            onChange={(e) => accept(e.target.files && e.target.files[0])} />
          <span style={{ color: `rgba(${ACCENT_RGB},0.8)` }}><ArrowUpRight size={22} style={{ transform: 'rotate(-45deg)' }} /></span>
          {file ? (
            <span style={{ fontFamily: MONO, fontSize: '0.85rem', color: 'white', display: 'inline-flex', gap: 10, alignItems: 'center' }}>
              {file.name}
              <span role="button" onClick={(e) => { e.preventDefault(); setFile(null); setState({ status: 'idle' }); if (inputRef.current) inputRef.current.value = ''; }}
                style={{ color: ROSE, cursor: 'pointer' }}><X size={14} /></span>
            </span>
          ) : (
            <>
              <span style={{ fontFamily: BODY, fontSize: '0.92rem', color: 'white' }}>Drop a <span style={{ fontFamily: MONO }}>.session</span> file, or click to choose</span>
              <span style={{ fontFamily: BODY, fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Telethon session, up to 2&nbsp;MB</span>
            </>
          )}
        </label>

        {configured && <div ref={turnstileRef} style={{ minHeight: 65 }} />}

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
          <PrimaryButton onClick={submit} disabled={!file || state.status === 'loading'}>
            {state.status === 'loading' ? <><Spinner /> Checking…</> : 'Check account'}
          </PrimaryButton>
          <span style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
            {state.status === 'loading' ? 'Connecting to Telegram and running the probes…' : 'Deleted immediately. Only facts and a one-way fingerprint are kept.'}
          </span>
        </div>
        {state.status === 'error' && <span style={{ fontFamily: BODY, fontSize: '0.86rem', color: ROSE }}>{state.message}</span>}
      </div>

      {state.status === 'result' && <AccountResult r={state.result} />}
      {state.status === 'result' && (
        <NextStep tool="account" stepKey={accountNextStepKey(state.result)} result={state.result} />
      )}
      {state.status === 'limit' && <LimitScreen retryMinutes={state.retryMinutes} tool="account" />}
    </div>
  );
}

Object.assign(window, { ProxyCheckerWidget, ProxyBatchWidget, AccountCheckerWidget });
