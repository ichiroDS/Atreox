
/* ══════════════════════════════════════════════════════════════════
   home.jsx

   Answers, in this order: what this is, who it's for, how it runs,
   what it costs, why trust it. The "how it runs" pipeline is the
   centre of the page — five stages as a sequence you can step
   through, each with the panel it corresponds to, not a bullet list.
══════════════════════════════════════════════════════════════════ */

const React = window.React;
const { useState, useRef, useEffect } = React;
const {
  motion, useInView,
  ArrowUpRight, Zap, Shield, Globe, Brain, Check, Clock, Server,
  Network, Sparkles, MessageSquare, Layers, BookOpen,
  BlurText, FooterBar, CrossLinks, SectionLockup, Pill,
  TypeText, tiltHandlers, REDUCED_MOTION,
  MODULES, MODULE_BY_KEY, PIPELINE,
  FULL_MONTHLY, FULL_YEARLY, YEARLY_SAVING, CHEAPEST_MODULE, eur,
} = window;

const MONO  = "'JetBrains Mono', monospace";
const SERIF = "'Playfair Display', Georgia, serif";
const GREEN = window.ACCENT;
const GREEN_RGB = window.ACCENT_RGB;

/* ─────────────────────────────────────────────────────────────────
   POSITIONING LINE — PLACEHOLDER.
   Final wording is still to be decided. This one is deliberately
   descriptive and makes no ranking or market-position claim; swap the
   string below when the real line is settled and nothing else needs
   to change.
   ───────────────────────────────────────────────────────────────── */
const POSITIONING = 'The whole Telegram growth stack — eight modules, one panel.';

/* ── Fake live activity feed pool (visual only, no live connection).
   Rows cycle through this list with real clock timestamps. ── */
const FEED_POOL = [
  { channel: '@CryptoAlphaCalls', comment: 'this dip is exactly the kind of setup I was waiting for 👀' },
  { channel: '@Web3BuildersHub',  comment: 'anyone tried scaling this on L2 yet? curious about gas costs' },
  { channel: '@AITradingSignals', comment: 'the backtest numbers on this strategy look solid ngl' },
  { channel: '@DeFiDegensChat',   comment: 'been looking for something exactly like this, saving the thread' },
  { channel: '@OnChainDaily',     comment: 'volume profile here looks way healthier than last week' },
  { channel: '@TechStackWeekly',  comment: 'the API pricing update actually makes this viable now' },
  { channel: '@AltcoinRadar',     comment: 'accumulation zone looking clean on the 4h chart' },
  { channel: '@BuildersLounge',   comment: 'shipped something similar last month, happy to compare notes' },
  { channel: '@AICreatorsHub',    comment: 'her channel went from dead to 400 new subs in two weeks, wild' },
  { channel: '@CreatorFunnelLab', comment: 'pinned post + bio link combo is converting way better for me' },
];

const fmtTime = ms => new Date(ms).toTimeString().slice(0, 8);

/* ── CountUp: eased count-up on first view, bright tick flash on later updates ── */
function CountUp({ to, inView, duration = 1500 }) {
  const [val, setVal] = useState(REDUCED_MOTION ? to : 0);
  const started = useRef(false);
  const done = useRef(REDUCED_MOTION);
  useEffect(() => {
    if (!inView || started.current || REDUCED_MOTION) return;
    started.current = true;
    const target = to;
    const t0 = performance.now();
    let raf;
    const step = t => {
      const p = Math.min((t - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * ease));
      if (p < 1) raf = requestAnimationFrame(step);
      else done.current = true;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView]);
  useEffect(() => { if (done.current) setVal(to); }, [to]);
  return (
    <span key={done.current ? to : 'counting'} className={done.current ? 'stat-tick' : undefined}>
      {val.toLocaleString('en-US')}
    </span>
  );
}

/* ── Stat readout: counts up when visible, "comments today" keeps ticking ── */
function StatReadout() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [comments, setComments] = useState(1284);
  useEffect(() => {
    if (!inView || REDUCED_MOTION) return;
    const iv = setInterval(() => setComments(c => c + 1 + Math.floor(Math.random() * 3)), 5200);
    return () => clearInterval(iv);
  }, [inView]);
  const stats = [
    { val: 42, label: 'Accounts active' },
    { val: comments, label: 'Comments today' },
    { val: 96, label: 'Channels tracked' },
  ];
  return (
    <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', background: `rgba(${GREEN_RGB},0.03)` }}>
      {stats.map(({ val, label }, i) => (
        <div key={label} style={{ padding: '16px 8px', textAlign: 'center', borderLeft: i > 0 ? `1px solid rgba(${GREEN_RGB},0.1)` : 'none' }}>
          <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '1.45rem', color: GREEN, lineHeight: 1, marginBottom: 5, textShadow: `0 0 18px rgba(${GREEN_RGB},0.35)` }}>
            <CountUp to={val} inView={inView} />
          </div>
          <div style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.55rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

/* ── LiveTerminal: the hero's engine-log card, cycling like a real feed ── */
function LiveTerminal() {
  const [rows, setRows] = useState(() => {
    const t = Date.now();
    return FEED_POOL.slice(0, 4).map((item, i) => ({
      ...item, uid: i,
      time: fmtTime(t - (3 - i) * 41000),
      status: i === 3 ? 'queued' : 'posted',
    }));
  });
  const nextIdx = useRef(4);
  const nextUid = useRef(4);
  const flips = useRef([]);

  useEffect(() => {
    if (REDUCED_MOTION) return;
    const flip = uid => flips.current.push(setTimeout(() => {
      setRows(rs => rs.map(r => (r.uid === uid ? { ...r, status: 'posted' } : r)));
    }, 1900));
    flip(3); /* the initial queued row resolves too */
    const iv = setInterval(() => {
      const item = FEED_POOL[nextIdx.current % FEED_POOL.length];
      nextIdx.current += 1;
      const uid = nextUid.current++;
      setRows(rs => [...rs, { ...item, uid, time: fmtTime(Date.now()), status: 'queued' }].slice(-4));
      flip(uid);
    }, 3600);
    return () => { clearInterval(iv); flips.current.forEach(clearTimeout); };
  }, []);

  return (
    <div className="panel ticks" {...tiltHandlers(3.5)}
      style={{ borderRadius: 6, padding: 0, overflow: 'hidden', transition: 'transform 0.25s ease', willChange: 'transform' }}>
      {/* Terminal header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderBottom: `1px solid rgba(${GREEN_RGB},0.14)`, background: `rgba(${GREEN_RGB},0.04)` }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN, animation: 'pulse-dot 1.8s ease-in-out infinite', flexShrink: 0 }} />
        <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.66rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'white' }}>Live engine activity</span>
        <span style={{ marginLeft: 'auto', fontFamily: MONO, fontWeight: 400, fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)' }}>preview</span>
      </div>

      {/* Log rows */}
      <div>
        {rows.map(item => (
          <div key={item.uid} className="feed-row" style={{ padding: '13px 20px', borderBottom: `1px solid rgba(${GREEN_RGB},0.08)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.64rem', color: 'rgba(255,255,255,0.28)', flexShrink: 0 }}>{item.time}</span>
              <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.72rem', color: GREEN, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{item.channel}</span>
              <span style={{
                marginLeft: 'auto', flexShrink: 0, fontFamily: MONO, fontWeight: 500, fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                color: item.status === 'posted' ? GREEN : 'rgba(255,255,255,0.38)',
                transition: 'color 0.3s ease',
              }}>[{item.status}]</span>
            </div>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.84rem', color: 'rgba(255,255,255,0.62)', lineHeight: 1.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>"{item.comment}"</p>
          </div>
        ))}
        {/* Listening row — the engine never sleeps */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '11px 20px', borderBottom: `1px solid rgba(${GREEN_RGB},0.08)` }}>
          <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.66rem', letterSpacing: '0.06em', color: `rgba(${GREEN_RGB},0.55)` }}>
            {'> '}engine listening<span className="dots" />
          </span>
          <span className="cursor" style={{ width: 6, height: '0.75em', marginLeft: 8 }} />
        </div>
      </div>

      {/* Stat readout */}
      <StatReadout />
    </div>
  );
}

/* ── Hero ── */
function Hero({ setPage }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <section style={{ position: 'relative', overflow: 'hidden', minHeight: 860 }}>
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', padding: isMobile ? '110px 5% 40px' : '160px 5% 80px', display: 'flex', gap: isMobile ? 32 : 64, alignItems: 'center', flexWrap: 'wrap' }}>

        {/* Left column */}
        <div style={{ flex: '1 1 400px', minWidth: 0 }}>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="overline" style={{ display: 'block', marginBottom: 22 }}>
            {'// '}<TypeText text="Neuro-commenting for Telegram" startDelay={1200} /><span className="cursor" />
          </motion.p>
          <BlurText text="AI-powered Telegram growth, on autopilot."
            style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(2.7rem, 5.8vw, 4.4rem)', color: 'white', lineHeight: 1.08, letterSpacing: '-0.015em', maxWidth: 640, marginBottom: 20 }}
            delay={110}
            glowWords={['Telegram']}
          />
          {/* positioning line — see POSITIONING at the top of this file */}
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.66 }}
            style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.72rem', letterSpacing: '0.12em', color: `rgba(${GREEN_RGB},0.85)`, marginBottom: 24, lineHeight: 1.6 }}>
            {POSITIONING}
          </motion.p>
          <motion.p initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }} animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}
            style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.72)', maxWidth: 520, lineHeight: 1.65, marginBottom: 36 }}>
            ATREOX finds the channels your audience already reads, warms a network of accounts until they
            behave like real ones, and then comments, answers DMs and reacts from those accounts — around
            the clock, from one panel you control.
          </motion.p>
          <motion.div initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }} animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.1 }}
            style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', marginBottom: 30 }}>
            <a href="https://app.atreoxai.com" target="_self" className="btn-solid cta-breathe" style={{ padding: '15px 28px', fontSize: '0.8rem' }}>
              Enter panel <ArrowUpRight size={15} />
            </a>
            <button className="btn-outline" onClick={() => {
              const el = document.getElementById('how-it-runs');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }} style={{ padding: '14px 24px' }}>
              See how it runs <ArrowUpRight size={14} />
            </button>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.7 }}
            style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.66rem', color: 'rgba(255,255,255,0.32)', letterSpacing: '0.08em' }}>
            Built for: crypto, AI & tech creators — and anyone growing a Telegram funnel · English-language market · 24/7 automation
          </motion.p>
        </div>

        {/* Right column — engine log terminal */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
          style={{ flex: '1 1 420px', minWidth: 0 }}>
          <LiveTerminal />
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════
   1 — WHAT THIS IS
══════════════════════════════════════ */
function WhatThisIsSection({ setPage }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.12 });

  return (
    <section ref={ref} className="section-block" style={{ padding: '88px 5%', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 56, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 44 }}>
        <motion.div style={{ flex: '1 1 420px', minWidth: 0 }}
          initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
          <span className="overline" style={{ display: 'block', marginBottom: 16 }}>{'// '}What this is</span>
          <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'white', lineHeight: 1.1, letterSpacing: '-0.015em', marginBottom: 20 }}>
            One panel that runs a network of Telegram accounts
          </h2>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.78, maxWidth: 560 }}>
            ATREOX is a cloud panel, not a program you install. You bring Telegram accounts and proxies;
            it handles everything they then do — finding targets, building history, writing comments,
            answering messages, adding reactions — with every setting exposed and every action logged.
            Take one module or take all of them; they're billed and run separately.
          </p>
        </motion.div>

        <motion.div style={{ flex: '0 1 300px', minWidth: 240 }}
          initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.12 }}>
          <div className="panel" style={{ padding: '24px 24px 22px' }}>
            {[
              ['Runs in the browser', 'Nothing to install. The engine runs on our side, not your machine.'],
              ['Your accounts, your proxies', 'Bring your own. Nothing is rented to you and nothing is shared.'],
              ['Everything is logged', 'Every comment, reply, reaction and failure, with the reason attached.'],
              ['Monthly, cancel anytime', 'No contract. Modules are billed one at a time.'],
            ].map(([t, b], i, arr) => (
              <div key={t} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', paddingBottom: i === arr.length - 1 ? 0 : 16, marginBottom: i === arr.length - 1 ? 0 : 16, borderBottom: i === arr.length - 1 ? 'none' : `1px solid rgba(${GREEN_RGB},0.09)` }}>
                <Check size={14} color={GREEN} style={{ marginTop: 3, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.85rem', color: 'white', marginBottom: 3 }}>{t}</span>
                  <span style={{ display: 'block', fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{b}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* the eight, at a glance — every tile is a way into Functions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
        {MODULES.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.button key={m.key} type="button" onClick={() => setPage('functions', 'fn-' + m.key)}
              initial={{ opacity: 0, y: 14 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.2 + i * 0.05 }}
              className="panel panel-hover"
              style={{ padding: '18px 18px', textAlign: 'left', background: 'transparent', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Icon size={17} color={GREEN} />
              <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.65rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: 'white', lineHeight: 1.35 }}>
                {m.name}
              </span>
              <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.58rem', letterSpacing: '0.09em', color: m.included ? 'rgba(255,255,255,0.3)' : `rgba(${GREEN_RGB},0.65)` }}>
                {m.included ? 'included' : `${eur(m.price)} / mo`}
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════
   2 — WHO IT'S FOR
══════════════════════════════════════ */
function AudienceSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const audiences = [
    { icon: Network, title: 'Crypto & AI projects',
      body: 'Grow the channel behind your token or product. Show up in the trading and builder communities where your future holders already talk.' },
    { icon: Sparkles, title: 'AI influencer & persona operators',
      body: 'Funnel attention from niche channels straight to your model\'s Telegram — and from there to whichever platform monetizes it.' },
    { icon: MessageSquare, title: 'Content creators & solo brands',
      body: 'Turn the channels your audience already reads into a steady discovery source for your work — no ad budget required.' },
    { icon: Layers, title: 'Agencies & growth marketers',
      body: 'Run multi-account campaigns for multiple clients from one dashboard, with per-persona tone and full engine visibility.' },
  ];
  return (
    <section ref={ref} className="section-block" style={{ padding: '88px 5%', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
          <span className="overline" style={{ display: 'block', marginBottom: 16 }}>{'// '}Who it's for</span>
          <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(1.9rem, 3.8vw, 2.8rem)', color: 'white', letterSpacing: '-0.01em', lineHeight: 1.1, marginBottom: 14 }}>
            Any niche. Any funnel.
          </h2>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>
            If your growth depends on Telegram traffic, ATREOX was built for you.
          </p>
        </motion.div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
        {audiences.map(({ icon: Icon, title, body }, i) => (
          <motion.div key={i} className="panel panel-hover"
            initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay: i * 0.09 }}
            style={{ padding: '30px 26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <div style={{ width: 46, height: 46, borderRadius: 5, background: `rgba(${GREEN_RGB},0.08)`, border: `1px solid rgba(${GREEN_RGB},0.22)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={GREEN} />
              </div>
              <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.62rem', letterSpacing: '0.14em', color: `rgba(${GREEN_RGB},0.4)` }}>{String(i + 1).padStart(2, '0')}</span>
            </div>
            <h4 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.95rem', color: 'white', marginBottom: 10 }}>{title}</h4>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>{body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════
   3 — HOW IT RUNS  (the pipeline)

   Five stages, stepped through in place. Each stage shows the panel
   surface it corresponds to rather than describing it, because the
   whole argument of this section is that these are five real screens
   feeding each other, not five bullet points.
══════════════════════════════════════ */

/* — shared chrome for a stage mock — */
function MockFrame({ title, right, children }) {
  return (
    <div style={{ border: `1px solid rgba(${GREEN_RGB},0.16)`, borderRadius: 5, overflow: 'hidden', background: 'rgba(0,0,0,0.32)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', borderBottom: `1px solid rgba(${GREEN_RGB},0.12)`, background: `rgba(${GREEN_RGB},0.04)` }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: GREEN, flexShrink: 0, animation: 'pulse-dot 2s ease-in-out infinite' }} />
        <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.58rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>{title}</span>
        {right && <span style={{ marginLeft: 'auto', fontFamily: MONO, fontWeight: 400, fontSize: '0.55rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>{right}</span>}
      </div>
      <div style={{ padding: '4px 0' }}>{children}</div>
    </div>
  );
}

const mockRow = {
  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px',
  fontFamily: MONO, fontSize: '0.66rem', fontWeight: 400,
};

function Verdict({ ok, children }) {
  return (
    <span style={{
      flexShrink: 0, fontFamily: MONO, fontWeight: 600, fontSize: '0.53rem',
      letterSpacing: '0.12em', textTransform: 'uppercase',
      color: ok ? GREEN : 'rgba(255,255,255,0.3)',
    }}>{children}</span>
  );
}

/* 01 — discovery results */
function MockFind() {
  const rows = [
    ['@CryptoAlphaCalls', '18.4k', '42', true],
    ['@Web3BuildersHub', '9.1k', '27', true],
    ['@AltcoinRadar', '31.2k', '3', false],
    ['@DeadSignalsDaily', '54.8k', '0', false],
    ['@BuildersLounge', '6.7k', '19', true],
  ];
  return (
    <MockFrame title="Channel Parser · results" right="scored">
      {rows.map(([name, members, comments, ok]) => (
        <div key={name} style={{ ...mockRow, opacity: ok ? 1 : 0.42 }}>
          <span style={{ color: ok ? GREEN : 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: '1 1 auto', minWidth: 0 }}>{name}</span>
          <span style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0, width: 46, textAlign: 'right' }}>{members}</span>
          <span style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0, width: 62, textAlign: 'right' }}>{comments} cmts</span>
          <Verdict ok={ok}>{ok ? 'accept' : 'reject'}</Verdict>
        </div>
      ))}
    </MockFrame>
  );
}

/* 02 — warmup progress */
function MockWarm() {
  const rows = [
    ['acct_0148', 94, 'reading'],
    ['acct_0149', 71, 'joined channel'],
    ['acct_0150', 46, 'reacted'],
    ['acct_0151', 22, 'resting'],
  ];
  return (
    <MockFrame title="Active Warmup · status" right="window open">
      {rows.map(([id, pct, act]) => (
        <div key={id} style={{ padding: '10px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7, fontFamily: MONO, fontSize: '0.64rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', flexShrink: 0 }}>{id}</span>
            <span style={{ color: `rgba(${GREEN_RGB},0.7)`, fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{act}</span>
            <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{pct}%</span>
          </div>
          <div className="mini-bar"><i style={{ width: pct + '%' }} /></div>
        </div>
      ))}
    </MockFrame>
  );
}

/* 03 — a post and the comment written for it */
function MockComment() {
  return (
    <MockFrame title="Neurocommenting · live" right="posted">
      <div style={{ padding: '12px 14px', borderBottom: `1px solid rgba(${GREEN_RGB},0.08)` }}>
        <span style={{ display: 'block', fontFamily: MONO, fontSize: '0.56rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 7 }}>Post · @Web3BuildersHub</span>
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.55 }}>
          "Gas on the new L2 rollup dropped 60% after the last upgrade. Full benchmark thread below 👇"
        </p>
      </div>
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
          <span style={{ fontFamily: MONO, fontSize: '0.56rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: `rgba(${GREEN_RGB},0.8)` }}>Comment · acct_0148</span>
          <span style={{ marginLeft: 'auto' }}><Verdict ok>sent</Verdict></span>
        </div>
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.84rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.6 }}>
          "60% is wild — is that holding under load or just off-peak? curious what the p95 looks like"
        </p>
      </div>
    </MockFrame>
  );
}

/* 04 — a DM thread */
function MockDM() {
  const bubble = (out, text) => (
    <div style={{ display: 'flex', justifyContent: out ? 'flex-end' : 'flex-start', padding: '5px 14px' }}>
      <span style={{
        maxWidth: '82%', padding: '9px 12px', borderRadius: 5,
        background: out ? `rgba(${GREEN_RGB},0.1)` : 'rgba(255,255,255,0.045)',
        border: `1px solid ${out ? `rgba(${GREEN_RGB},0.24)` : 'rgba(255,255,255,0.07)'}`,
        fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.82rem',
        color: out ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.6)', lineHeight: 1.5,
      }}>{text}</span>
    </div>
  );
  return (
    <MockFrame title="NeuroDialogs · thread" right="in session">
      <div style={{ paddingTop: 6, paddingBottom: 4 }}>
        {bubble(false, 'saw your comment in the L2 thread — what do you actually build?')}
        {bubble(true, "mostly tooling around rollup infra. what are you working on?")}
        {bubble(false, 'trying to pick a chain for a launch, honestly lost')}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px 4px' }}>
          <span style={{ fontFamily: MONO, fontSize: '0.56rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: `rgba(${GREEN_RGB},0.6)` }}>typing</span>
          <span className="dots" style={{ color: `rgba(${GREEN_RGB},0.6)`, fontFamily: MONO, fontSize: '0.7rem' }} />
          <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: '0.54rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.26)' }}>reply in 41s</span>
        </div>
      </div>
    </MockFrame>
  );
}

/* 05 — reactions arriving */
function MockReact() {
  const chips = [['🔥', 24], ['👍', 17], ['🚀', 11], ['❤️', 8]];
  return (
    <MockFrame title="Mass Reactions · run" right="human curve">
      <div style={{ padding: '12px 14px', borderBottom: `1px solid rgba(${GREEN_RGB},0.08)` }}>
        <span style={{ display: 'block', fontFamily: MONO, fontSize: '0.56rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>Target · @CryptoAlphaCalls · post 4812</span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {chips.map(([e, n]) => (
            <span key={e} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 3,
              border: `1px solid rgba(${GREEN_RGB},0.24)`, background: `rgba(${GREEN_RGB},0.07)`,
              fontFamily: MONO, fontSize: '0.66rem', color: 'rgba(255,255,255,0.75)',
            }}>{e} {n}</span>
          ))}
        </div>
      </div>
      {[['00:00', '4 accounts reacted'], ['00:11', '7 accounts reacted'], ['00:38', '9 accounts reacted'], ['01:24', 'pool coverage 62% — stop']].map(([t, l]) => (
        <div key={t} style={mockRow}>
          <span style={{ color: 'rgba(255,255,255,0.28)', flexShrink: 0 }}>+{t}</span>
          <span style={{ color: 'rgba(255,255,255,0.55)' }}>{l}</span>
        </div>
      ))}
    </MockFrame>
  );
}

const STAGE_MOCKS = { find: MockFind, warm: MockWarm, comment: MockComment, dm: MockDM, react: MockReact };

function PipelineSection({ setPage }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  /* Auto-advance until the visitor takes over — after that it's theirs. */
  useEffect(() => {
    if (!inView || pinned || REDUCED_MOTION) return;
    const iv = setInterval(() => setActive(a => (a + 1) % PIPELINE.length), 5200);
    return () => clearInterval(iv);
  }, [inView, pinned]);

  const stage = PIPELINE[active];
  const Mock = STAGE_MOCKS[stage.key];
  const pct = ((active + 0.5) / PIPELINE.length) * 100;

  return (
    <section ref={ref} id="how-it-runs" className="section-block"
      style={{ padding: '88px 5%', maxWidth: 1280, margin: '0 auto', scrollMarginTop: 72 }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
        <SectionLockup title="How it runs">
          Five stages, in order, each one feeding the next. Step through them — every stage is a real
          surface in the panel, and every stage is a module you can buy on its own.
        </SectionLockup>
      </motion.div>

      {/* ── the rail ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }}
        style={{ position: 'relative', marginBottom: 34 }}>
        {/* track + fill, sitting behind the dots */}
        <div aria-hidden="true" style={{ position: 'absolute', left: 6, right: 6, top: 6, height: 1, background: `rgba(${GREEN_RGB},0.16)` }} />
        <div aria-hidden="true" style={{
          position: 'absolute', left: 6, top: 6, height: 1, width: `calc(${pct}% - 6px)`,
          background: `linear-gradient(90deg, rgba(${GREEN_RGB},0.5), var(--g-bright))`,
          boxShadow: `0 0 10px rgba(${GREEN_RGB},0.6)`,
          transition: 'width 0.45s cubic-bezier(0.16,1,0.3,1)',
        }} />
        <div role="tablist" aria-label="Pipeline stages"
          style={{ position: 'relative', display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 4 }}>
          {PIPELINE.map((s, i) => (
            <button key={s.key} type="button" role="tab" aria-selected={active === i}
              className="pipe-node"
              onClick={() => { setActive(i); setPinned(true); }}>
              <span aria-hidden="true" className="pipe-dot" />
              <span className="pipe-idx">{String(i + 1).padStart(2, '0')} · {s.label}</span>
              <span className="pipe-verb">{s.verb}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── the active stage ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.18 }}
        className="panel ticks" style={{ padding: 'clamp(24px, 3.4vw, 40px)' }}>
        <div key={stage.key} className="stage-body"
          style={{ display: 'flex', gap: 36, flexWrap: 'wrap', alignItems: 'flex-start' }}>

          {/* words */}
          <div style={{ flex: '1 1 330px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <Pill dot>{`Stage ${active + 1} of ${PIPELINE.length}`}</Pill>
              <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.6rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)' }}>{stage.label}</span>
            </div>
            <h3 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: 'white', letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: 14 }}>
              {stage.verb}
            </h3>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.98rem', color: `rgba(${GREEN_RGB},0.85)`, lineHeight: 1.6, marginBottom: 14 }}>
              {stage.line}
            </p>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.92rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.78, marginBottom: 22, maxWidth: 520 }}>
              {stage.detail}
            </p>

            {/* which modules do this — straight into Functions */}
            <span style={{ display: 'block', fontFamily: MONO, fontWeight: 500, fontSize: '0.56rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
              {'// '}Runs on
            </span>
            <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
              {stage.modules.map(k => {
                const m = MODULE_BY_KEY[k];
                const Icon = m.icon;
                return (
                  <button key={k} type="button" onClick={() => setPage('functions', 'fn-' + k)}
                    className="panel panel-hover"
                    style={{
                      padding: '9px 13px', display: 'inline-flex', alignItems: 'center', gap: 9,
                      background: 'transparent', borderRadius: 4,
                    }}>
                    <Icon size={13} color={GREEN} />
                    <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'white' }}>{m.name}</span>
                    <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.56rem', letterSpacing: '0.08em', color: m.included ? 'rgba(255,255,255,0.3)' : `rgba(${GREEN_RGB},0.65)` }}>
                      {m.included ? 'incl.' : eur(m.price)}
                    </span>
                    <ArrowUpRight size={11} color={`rgba(${GREEN_RGB},0.5)`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* the panel surface this stage corresponds to */}
          <div style={{ flex: '1 1 340px', minWidth: 0 }}>
            <Mock />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ══════════════════════════════════════
   4 — WHAT IT COSTS
══════════════════════════════════════ */
function PriceTeaserSection({ setPage }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section ref={ref} className="section-block" style={{ padding: '88px 5%', maxWidth: 1280, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
        <SectionLockup title="What it costs">
          Modules are priced one at a time, so a campaign that only needs discovery and commenting only
          pays for discovery and commenting. Take all of them and the full licence is cheaper than the sum.
        </SectionLockup>
      </motion.div>

      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'stretch' }}>
        <motion.div className="panel" style={{ flex: '1 1 300px', padding: '30px 28px', display: 'flex', flexDirection: 'column' }}
          initial={{ opacity: 0, y: 26 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55 }}>
          <span className="overline" style={{ display: 'block', marginBottom: 18 }}>{'// '}Single module</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
            <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>from</span>
            <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '2.4rem', color: GREEN, lineHeight: 1 }}>{eur(CHEAPEST_MODULE)}</span>
            <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.64rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>/ month</span>
          </div>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.87rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 20 }}>
            Pick exactly what you'll run. Each module bills monthly and runs on its own.
          </p>
          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: `1px solid rgba(${GREEN_RGB},0.1)` }}>
            <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.62rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.34)' }}>
              Account Manager + Profile Templates included
            </span>
          </div>
        </motion.div>

        <motion.div className="panel ticks featured-pulse" style={{ flex: '1 1 300px', padding: '30px 28px', borderColor: `rgba(${GREEN_RGB},0.4)`, display: 'flex', flexDirection: 'column' }}
          initial={{ opacity: 0, y: 26 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay: 0.09 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 18 }}>
            <span className="overline">{'// '}Full licence</span>
            <Pill dot>All six</Pill>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
            <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '2.6rem', color: GREEN, lineHeight: 1, textShadow: `0 0 28px rgba(${GREEN_RGB},0.3)` }}>{eur(FULL_MONTHLY)}</span>
            <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.64rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>/ month</span>
          </div>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.87rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 20 }}>
            Every module, plus any released while your licence is active. {eur(FULL_YEARLY)} a year saves {eur(YEARLY_SAVING)}.
          </p>
          <div style={{ marginTop: 'auto' }}>
            <button className="btn-solid" onClick={() => setPage('pricing')} style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '0.76rem' }}>
              Build your licence <ArrowUpRight size={14} />
            </button>
          </div>
        </motion.div>

        <motion.div className="panel" style={{ flex: '1 1 260px', padding: '30px 28px', display: 'flex', flexDirection: 'column' }}
          initial={{ opacity: 0, y: 26 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay: 0.18 }}>
          <span className="overline" style={{ display: 'block', marginBottom: 18 }}>{'// '}What you also need</span>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.87rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: 20 }}>
            ATREOX doesn't sell accounts or proxies — you bring your own, and what you spend there is
            up to you. Both guides on how to buy them well are on the Guides page.
          </p>
          <div style={{ marginTop: 'auto' }}>
            <button type="button" className="quiet-link" onClick={() => setPage('guides')}>
              <BookOpen size={12} /> Read the setup guides <ArrowUpRight size={12} />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════
   5 — WHY TRUST IT
══════════════════════════════════════ */
function TrustSection({ setPage }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.12 });

  const pillars = [
    { icon: Shield, title: 'Accounts are treated as the scarce thing',
      body: 'Warmup before work, one proxy per account, per-account rate budgets, and automatic cooldowns on floodwait and peerflood. An account that trips a limit pauses itself instead of grinding into a ban.' },
    { icon: Server, title: 'Two different health checks',
      body: "Telegram's own restricted/scam/fake flags, and a separate capability probe that resolves a public username and reads its history — which is what actually catches an account that's frozen while every flag stays clean." },
    { icon: Zap, title: 'Nothing runs faster than you set it',
      body: 'Every module exposes its delays, its hourly and daily caps, and its skip probabilities. Defaults are conservative and every one of them is yours to move.' },
    { icon: Brain, title: 'Every action is logged with its reason',
      body: 'Generated, skipped, rate-limited, failed — each with the post, thread or target it belongs to. When something stops, the log says why rather than going quiet.' },
    { icon: Clock, title: 'Dry runs before real ones',
      body: 'Mass Reactions can do a full pass and report exactly what it would have done without sending anything. Discovery searches are cancellable mid-run.' },
    { icon: Globe, title: 'Monthly, no contract',
      body: "It's a monthly subscription you cancel from the panel, keeping access to the end of the period. Modules are separate line items, so scaling down doesn't mean starting over." },
  ];

  return (
    <section ref={ref} className="section-block" style={{ padding: '88px 5%', maxWidth: 1280, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
        <SectionLockup title="Why trust it">
          Automation on Telegram fails in one direction: too fast, too uniform, too visible. Every design
          decision below exists because of that, and all of it is visible to you while it runs.
        </SectionLockup>
      </motion.div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
        {pillars.map(({ icon: Icon, title, body }, i) => (
          <motion.div key={title} className="panel panel-hover"
            initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.07 }}
            style={{ padding: '28px 26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ width: 42, height: 42, borderRadius: 5, background: `rgba(${GREEN_RGB},0.08)`, border: `1px solid rgba(${GREEN_RGB},0.22)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color={GREEN} />
              </div>
              <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.6rem', letterSpacing: '0.14em', color: `rgba(${GREEN_RGB},0.35)` }}>{String(i + 1).padStart(2, '0')}</span>
            </div>
            <h4 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.94rem', color: 'white', marginBottom: 10, lineHeight: 1.4 }}>{title}</h4>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════
   6 — FAQ
══════════════════════════════════════ */
function FAQSection({ setPage }) {
  const ref  = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: 'What do I need before I can start?',
      a: 'Telegram accounts and one proxy per account. ATREOX does not sell either — you bring your own, import them through the Account Manager, and the panel takes it from there. Both purchases have their own guide on the Guides page.' },
    { q: 'How does account safety actually work?',
      a: 'Accounts warm up before they do anything that earns: scheduled reading, joins and reactions at a pace matched to the account\'s age. Once working, each one runs behind its own proxy inside its own hourly and daily budget, with randomised delays between actions. Floodwait and peerflood put an account into cooldown automatically, and repeated ones stop it rather than retrying into a ban.' },
    { q: 'Can I bring my own Telegram accounts?',
      a: 'Yes — that is the only way it works. Import them individually, in bulk up to 100 per request, or by converting tdata folders. Every account then goes through the same health checks and warmup as any other.' },
    { q: 'Do I have to buy all eight modules?',
      a: 'No. Each priced module bills separately and runs on its own, so you can run discovery and commenting and nothing else. Account Manager and Profile Templates come with any purchase — they are how accounts get into the system, so they are never sold alone. If you want everything, the full licence costs less than the six added up.' },
    { q: 'Does this only work for crypto and tech channels?',
      a: 'No. The parsers search on your keywords in ten languages, and the comment and reply engines work from a prompt you write. Crypto and tech are where many users started; the same pipeline runs an AI-creator funnel or a content community without changing anything but the targets and the persona.' },
    { q: 'What happens when a guide I need has not been filmed yet?',
      a: 'Every module has a full write-up on the Functions page listing what it does and every setting it exposes — enough to configure it without a video. If you are stuck, write to us and we will walk you through it while the guide is being recorded.' },
    { q: 'Is there a contract, or can I cancel anytime?',
      a: "It's a monthly subscription with no long-term contract. Cancel from the panel and you keep access through the end of the billing period. Only the full licence is also sold by the year." },
  ];
  return (
    <section ref={ref} className="section-block" style={{ padding: '88px 5%', maxWidth: 860, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 48 }}>
        <span className="overline" style={{ display: 'block', marginBottom: 16 }}>{'// '}FAQ</span>
        <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(1.8rem, 3.3vw, 2.4rem)', color: 'white', letterSpacing: '-0.01em', lineHeight: 1.1, marginBottom: 12 }}>
          Frequently Asked Questions
        </h2>
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)' }}>
          Everything you need to know before you start
        </p>
      </motion.div>
      <div style={{ borderTop: `1px solid rgba(${GREEN_RGB},0.14)` }}>
        {faqs.map(({ q, a }, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.06 }}
            style={{ borderBottom: `1px solid rgba(${GREEN_RGB},0.14)` }}>
            <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', padding: '20px 6px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <span style={{ display: 'flex', alignItems: 'baseline', gap: 16, textAlign: 'left' }}>
                <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.62rem', letterSpacing: '0.1em', color: `rgba(${GREEN_RGB},0.45)`, flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.95rem', color: open === i ? GREEN : 'white', lineHeight: 1.4, transition: 'color 0.15s' }}>{q}</span>
              </span>
              <span style={{
                fontFamily: MONO, fontWeight: 400, fontSize: '1.05rem', lineHeight: 1, flexShrink: 0,
                color: open === i ? GREEN : 'rgba(255,255,255,0.38)',
                display: 'inline-block', transition: 'transform 0.2s ease, color 0.2s ease',
                transform: open === i ? 'rotate(45deg)' : 'none',
              }}>+</span>
            </button>
            {open === i && (
              <div className="faq-answer" style={{ padding: '0 6px 22px 40px' }}>
                <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.87rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 680 }}>{a}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════
   CTA
══════════════════════════════════════ */
function CtaBannerSection({ setPage }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  return (
    <section ref={ref} className="section-block" style={{ padding: '88px 5%', maxWidth: 1280, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}
        className="panel ticks" style={{ padding: 'clamp(64px, 9vw, 110px) 5%', textAlign: 'center' }}>
        <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(1.9rem, 4.2vw, 3.1rem)', color: 'white', letterSpacing: '-0.01em', lineHeight: 1.1, marginBottom: 16 }}>
          Ready to grow on Telegram?
        </h2>
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.55)', maxWidth: 440, margin: '0 auto 36px', lineHeight: 1.65 }}>
          Pick the modules you'll actually run, or take the whole licence and decide later.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-solid" onClick={() => setPage('pricing')} style={{ padding: '15px 32px', fontSize: '0.82rem' }}>
            See Pricing <ArrowUpRight size={15} />
          </button>
          <button className="btn-outline" onClick={() => setPage('functions')} style={{ padding: '14px 28px' }}>
            Explore Functions <ArrowUpRight size={14} />
          </button>
        </div>
      </motion.div>
    </section>
  );
}

/* ── Home Page ── */
function HomePage({ setPage }) {
  return (
    <div>
      <Hero setPage={setPage} />
      <WhatThisIsSection setPage={setPage} />
      <AudienceSection />
      <PipelineSection setPage={setPage} />
      <PriceTeaserSection setPage={setPage} />
      <TrustSection setPage={setPage} />
      <FAQSection setPage={setPage} />
      <CtaBannerSection setPage={setPage} />
      <CrossLinks current="home" setPage={setPage} />
      <div style={{ padding: '0 5% 60px' }}>
        <FooterBar setPage={setPage} />
      </div>
    </div>
  );
}

Object.assign(window, { HomePage });
