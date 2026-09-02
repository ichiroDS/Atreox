/* ══════════════════════════════════════════════════════════════════
   tool-checker.jsx — the interactive PUBLIC checkers.

   These are the working tools themselves, run on the site with no
   account: paste a proxy (or drop a .session) and get the full result,
   three times an hour per IP. The wall — hit exactly when someone has a
   batch — is the funnel, so the limit screen is designed as an invitation
   into the panel, not a refusal.

   Both talk to same-origin serverless bridges (api/tools/*.js), which
   hold the engine token and forward the call as public. The account
   checker adds Cloudflare Turnstile (the site key is injected as
   window.TURNSTILE_SITE_KEY on every page, same as the contact form).

   Design language is the site's: dark, technical, the cyan accent, mono
   overlines over serif headings. No score anywhere — only the facts, the
   same honesty rule the engine follows.
══════════════════════════════════════════════════════════════════ */

const React = window.React;
const { useState, useRef, useEffect, useCallback } = React;
const {
  ArrowUpRight, Check, X, Server, Globe, Shield, Zap, Cpu, Clock, Info,
} = window;
const ACCENT = window.ACCENT;
const ACCENT_RGB = window.ACCENT_RGB;
const MONO = window.MONO;
const SERIF = window.SERIF;
const BODY = 'Barlow, sans-serif';

const PANEL_BASE = 'https://app.atreoxai.com';
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
      style={inputStyle}
      onFocus={(e) => { e.target.style.borderColor = `rgba(${ACCENT_RGB},0.55)`; props.onFocus?.(e); }}
      onBlur={(e) => { e.target.style.borderColor = 'var(--g-14)'; props.onBlur?.(e); }}
    />
  );
}

function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
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

/* The most important screen: the wall reads as an invitation. */
function LimitScreen({ retryMinutes, tool }) {
  return (
    <div className="panel ticks" style={{ padding: '36px 30px', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <span style={{ ...label(), color: `rgba(${ACCENT_RGB},0.75)` }}>Free limit reached</span>
      <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '1.6rem', color: 'white', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
        That’s your 3 free {tool} checks this hour.
      </span>
      <span style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.98rem', color: 'rgba(255,255,255,0.62)', lineHeight: 1.75, maxWidth: 520 }}>
        The free checker resets hourly. Checking a whole batch? In the panel there’s no
        limit — run a whole list at once and keep a history for every proxy and account.
        Included with any ATREOX module.
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', marginTop: 4 }}>
        <a href={PANEL_BASE} style={{
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

/* ══ PROXY CHECKER ══════════════════════════════════════════════════ */

const IP_TYPE = { datacenter: 'Datacenter', residential: 'Residential', mobile: 'Mobile', unknown: 'Unknown' };
const REGION = (typeof Intl !== 'undefined' && Intl.DisplayNames) ? new Intl.DisplayNames(['en'], { type: 'region' }) : null;
function country(code) { if (!code) return null; try { return REGION ? REGION.of(code) : code; } catch { return code; } }
function ms(v) { return v == null ? '—' : `${Math.round(v)} ms`; }

function ProxyResult({ r }) {
  const tg = country(r.telegram.country);
  const ip = country(r.ip.country);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
        <VerdictPill ok={r.ok}>{r.ok ? 'Works with Telegram' : 'Not usable'}</VerdictPill>
        <span style={{ fontFamily: BODY, fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)' }}>
          {new Date(r.checked_at).toLocaleString()}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
        <StatTile label="TCP" value={ms(r.tcp.latency_ms)} />
        <StatTile label="To Telegram" value={ms(r.telegram.latency_ms)} />
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
          detail={r.ip.ok ? [r.ip.address, ip, IP_TYPE[r.ip.type], r.ip.asn == null ? null : `AS${r.ip.asn}`].filter(Boolean).join(' · ') : null}
          message={r.ip.ok ? r.ip.as_org : r.ip.message} />
      </div>
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
  const isMt = type === 'mtproto';

  const portNum = Number(port);
  const canSubmit = host.trim() && Number.isInteger(portNum) && portNum >= 1 && portNum <= 65535 && (!isMt || secret.trim());

  async function submit() {
    if (!canSubmit) return;
    setState({ status: 'loading' });
    const payload = { type, host: host.trim(), port: portNum };
    if (isMt) payload.secret = secret.trim();
    else { if (username.trim()) payload.username = username.trim(); if (password) payload.password = password; }
    try {
      const res = await fetch('/api/tools/proxy-check', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const e = await readError(res);
        setState(e.kind === 'limit' ? { status: 'limit', retryMinutes: e.retryMinutes } : { status: 'error', message: e.message });
        return;
      }
      setState({ status: 'result', result: await res.json() });
    } catch {
      setState({ status: 'error', message: 'Could not reach the checker. Try again.' });
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="panel" style={{ padding: '26px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
          <Field id="pc-type" label="Type">
            <select id="pc-type" value={type} onChange={(e) => setType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
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
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
          <PrimaryButton onClick={submit} disabled={!canSubmit || state.status === 'loading'}>
            {state.status === 'loading' ? <><Spinner /> Checking…</> : 'Check proxy'}
          </PrimaryButton>
          <span style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
            {state.status === 'loading'
              ? 'Connecting, then asking Telegram — up to half a minute.'
              : 'No account, no session. Nothing about the proxy is stored.'}
          </span>
        </div>
        {state.status === 'error' && (
          <span style={{ fontFamily: BODY, fontSize: '0.86rem', color: ROSE }}>{state.message}</span>
        )}
      </div>
      {state.status === 'result' && <ProxyResult r={state.result} />}
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

function useTurnstile() {
  const ref = useRef(null);
  const [token, setToken] = useState('');
  const siteKey = (typeof window !== 'undefined' && window.TURNSTILE_SITE_KEY) || '';
  const configured = /^[A-Za-z0-9_-]{8,}$/.test(siteKey);
  useEffect(() => {
    if (!configured) return;
    let widgetId;
    let cancelled = false;
    const render = () => {
      if (cancelled || !ref.current || !window.turnstile) return;
      widgetId = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        theme: 'dark',
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
    return () => { cancelled = true; try { if (widgetId && window.turnstile) window.turnstile.remove(widgetId); } catch { /* */ } };
  }, [configured, siteKey]);
  return { ref, token, configured };
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
      setState({ status: 'result', result: await res.json() });
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
      {state.status === 'limit' && <LimitScreen retryMinutes={state.retryMinutes} tool="account" />}
    </div>
  );
}

Object.assign(window, { ProxyCheckerWidget, AccountCheckerWidget });
