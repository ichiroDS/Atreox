
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
  ArrowUpRight, Zap, Shield, Globe, Brain, Check, Clock, Server, Ban, X,
  Network, Sparkles, MessageSquare, Layers, BookOpen,
  BlurText, FooterBar, CrossLinks, SectionLockup, Pill,
  TypeText, REDUCED_MOTION, SOCIAL_LINKS,
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

/* ══════════════════════════════════════════════════════════════════
   THE ENGINE GRID — the hero's right-hand card.

   Five modules, each running its own small demo of the thing it
   actually does. The pipeline walks through them on its own until the
   visitor takes it over: hovering a tile replays that module, clicking
   pins it. Only the focused tile animates, so five demos cost one
   timer and the eye always has one place to be.

   Everything in here is invented and says so — the card carries the
   same "Example — simulated" marker the Functions demos use, and the
   numbers are deliberately the size of a single run rather than a
   plausible account total. Nothing is shown that the engine does not
   do: parse, warm, comment, react, reply.
══════════════════════════════════════════════════════════════════ */

const DEMO_LABEL = 'Example — simulated';  /* same marker the Functions demos carry */
const DWELL = 4600;                        /* ms a stage holds before the pipeline moves on */

const SHOWCASE = [
  { key: 'channel-parser',  status: 'scanning',
    line: 'Finds the channels your audience already reads.' },
  { key: 'active-warmup',   status: 'warming',
    line: 'Builds a history on an account before it ever posts.' },
  { key: 'neurocommenting', status: 'writing', wide: true,
    line: 'Writes a comment against each new post, not a template.' },
  { key: 'mass-reactions',  status: 'reacting',
    line: 'Reactions arrive on a human curve, not all at once.' },
  { key: 'neurodialogs',    status: 'replying',
    line: 'Answers a DM from the thread so far, not the last line.' },
];

const cellLabel = { fontFamily: MONO, fontWeight: 500, fontSize: '0.5rem', letterSpacing: '0.14em', textTransform: 'uppercase' };
const cellText  = { fontFamily: MONO, fontWeight: 400, fontSize: '0.58rem' };

/* On-screen test for the card, deliberately optimistic: it starts true
   and only ever goes false once an observer has actually reported the
   card as off-screen. useInView starts at false, which is right for a
   section further down the page and wrong here — anywhere the observer
   never fires, that would leave the first screen sitting dead. */
function useOnScreen(ref) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    try {
      const el = ref.current;
      if (!el || !window.IntersectionObserver) return;
      const obs = new IntersectionObserver(([e]) => {
        try { setOn(e.isIntersecting); } catch (_) {}
      }, { threshold: 0.05 });
      obs.observe(el);
      return () => { try { obs.disconnect(); } catch (_) {} };
    } catch (_) {}
  }, []);
  return on;
}

/* Drives one tile's loop. A tile only runs a timer while it is the
   focused one; the rest park on their last frame, which is why
   re-focusing a tile replays it from the top. */
function useStep(active, period, cycle) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!active || REDUCED_MOTION) return;
    setStep(0);
    const iv = setInterval(() => setStep(s => (s + 1) % cycle), period);
    return () => clearInterval(iv);
  }, [active, period, cycle]);
  return active && !REDUCED_MOTION ? step : cycle - 1;
}

/* ── 01 · Channel Parser: candidates land, then get judged ── */
function ParserBody({ active, compact }) {
  const step = useStep(active, 620, 9);
  const rows = [
    ['@CryptoAlphaCalls', '18.4k', true],
    ['@DeadSignalsDaily', '54.8k', false],
    ['@Web3BuildersHub', '9.1k', true],
  ];
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: compact ? 3 : 5, height: '100%' }}>
      {active && !REDUCED_MOTION && (
        <span aria-hidden="true" className="eg-scan" style={{
          position: 'absolute', left: -12, right: -12, height: 1,
          background: `linear-gradient(90deg, transparent, rgba(${GREEN_RGB},0.7), transparent)`,
        }} />
      )}
      {rows.map(([name, members, ok], i) => {
        const shown = step >= i;
        const judged = step >= i + 2;
        return (
          <div key={name} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateY(5px)',
            transition: 'opacity 0.35s ease, transform 0.35s ease',
          }}>
            <span style={{
              ...cellText, flex: '1 1 auto', minWidth: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              color: judged ? (ok ? GREEN : 'rgba(255,255,255,0.26)') : 'rgba(255,255,255,0.55)',
              transition: 'color 0.35s ease',
            }}>{name}</span>
            {!compact && <span style={{ ...cellText, color: 'rgba(255,255,255,0.28)', flexShrink: 0 }}>{members}</span>}
            <span style={{
              ...cellLabel, fontWeight: 600, flexShrink: 0,
              color: ok ? GREEN : 'rgba(255,255,255,0.3)',
              opacity: judged ? 1 : 0, transition: 'opacity 0.3s ease',
            }}>{ok ? 'keep' : 'drop'}</span>
          </div>
        );
      })}
      <span style={{ ...cellLabel, marginTop: 'auto', color: `rgba(${GREEN_RGB},0.58)` }}>
        {step >= 5 ? '5 kept of 19 found' : 'evaluating'}
      </span>
    </div>
  );
}

/* ── 02 · Active Warmup: accounts filling their day's activity ── */
function WarmupBody({ active, compact }) {
  const step = useStep(active, 520, 10);
  const acts = ['reading', 'joined', 'reacted', 'resting'];
  const rows = [['acct_0148', 94], ['acct_0149', 71], ['acct_0150', 46]];
  const grow = Math.min(1, (step + 1) / 6);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 6 : 8, height: '100%', justifyContent: 'center' }}>
      {rows.map(([id, target], i) => (
        <div key={id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ ...cellText, color: 'rgba(255,255,255,0.48)', flexShrink: 0 }}>{id}</span>
            <span style={{
              ...cellLabel, marginLeft: 'auto', minWidth: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              color: `rgba(${GREEN_RGB},0.7)`,
            }}>{acts[(step + i) % acts.length]}</span>
          </div>
          <div className="mini-bar">
            <i style={{ width: Math.round(target * grow) + '%', transition: 'width 0.55s cubic-bezier(0.16,1,0.3,1)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── 03 · Neurocommenting: a post, and the comment written for it ── */
const COMMENT_DEMOS = [
  { channel: '@Web3BuildersHub',
    post: 'Gas on the new L2 dropped 60% after the upgrade 👇',
    reply: '60% is wild — does that hold under load, or off-peak?' },
  { channel: '@AITradingSignals',
    post: 'Backtest for the momentum model held through the chop.',
    reply: 'what window is that on? curious how it does in a flat month' },
];

function CommentBody({ active, compact }) {
  const [pair, setPair] = useState(0);
  const [typed, setTyped] = useState(0);
  const demo = COMMENT_DEMOS[pair % COMMENT_DEMOS.length];
  const full = demo.reply.length;

  /* One interval types the reply, holds it, then hands over to the next
     post — the pause is what makes it read as writing rather than a loop. */
  useEffect(() => {
    if (!active || REDUCED_MOTION) return;
    setTyped(0);
    let t = 0;
    const iv = setInterval(() => {
      t += 1;
      if (t <= full) setTyped(t);
      else if (t > full + 30) { t = 0; setPair(p => p + 1); }
    }, 34);
    return () => clearInterval(iv);
  }, [active, pair, full]);

  const live = active && !REDUCED_MOTION;
  const text = live ? demo.reply.slice(0, typed) : demo.reply;
  const done = text.length >= full;
  /* Reserved height, so the tile does not breathe as the reply types
     itself out — but a floor and a ceiling rather than a fixed height,
     so a width this was not sized for wraps to a second line instead of
     losing the bottom half of the sentence. */
  const body = {
    fontFamily: 'Barlow, sans-serif', fontWeight: 300,
    fontSize: compact ? '0.7rem' : '0.76rem', lineHeight: 1.45,
    minHeight: compact ? 34 : 20, maxHeight: compact ? 34 : 40, overflow: 'hidden',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 7 : 9, height: '100%' }}>
      <div>
        <span style={{ ...cellLabel, display: 'block', marginBottom: 3, color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Post · {demo.channel}
        </span>
        <p style={{ ...body, color: 'rgba(255,255,255,0.48)' }}>{demo.post}</p>
      </div>
      <div style={{ borderTop: `1px solid rgba(${GREEN_RGB},0.1)`, paddingTop: compact ? 7 : 9 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ ...cellLabel, color: `rgba(${GREEN_RGB},0.75)`, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Comment · acct_0148
          </span>
          <span style={{
            ...cellLabel, marginLeft: 'auto', fontWeight: 600, flexShrink: 0,
            color: done ? GREEN : 'rgba(255,255,255,0.28)', transition: 'color 0.3s ease',
          }}>{done ? 'sent' : 'writing'}</span>
        </div>
        <p style={{ ...body, color: 'rgba(255,255,255,0.78)' }}>
          {text}
          {live && !done && <span className="cursor" style={{ width: 5, height: '0.72em', marginLeft: 3 }} />}
        </p>
      </div>
    </div>
  );
}

/* ── 04 · Mass Reactions: the arrival curve, in miniature ──
   Positions are clustered early and thinned out after, the shape the
   engine's own human curve produces — see the Functions page demo. */
const REACT_ARRIVALS = [0.05, 0.08, 0.12, 0.16, 0.21, 0.27, 0.34, 0.42, 0.52, 0.64, 0.78, 0.93];

function ReactBody({ active, compact }) {
  const step = useStep(active, 360, 15);
  const chips = compact ? [['🔥', 24], ['👍', 17]] : [['🔥', 24], ['👍', 17], ['🚀', 11]];
  const arrived = Math.min(REACT_ARRIVALS.length, step + 1);
  const share = arrived / REACT_ARRIVALS.length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 7 : 9, height: '100%' }}>
      <div style={{ display: 'flex', gap: 5 }}>
        {chips.map(([emoji, n]) => (
          <span key={emoji} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 6px', borderRadius: 3,
            border: `1px solid rgba(${GREEN_RGB},0.22)`, background: `rgba(${GREEN_RGB},0.06)`,
            fontFamily: MONO, fontWeight: 500, fontSize: '0.55rem', lineHeight: 1, color: 'rgba(255,255,255,0.72)',
          }}>
            <span style={{ fontSize: '0.68rem' }}>{emoji}</span>{Math.max(1, Math.round(n * share))}
          </span>
        ))}
      </div>
      <div style={{
        position: 'relative', height: compact ? 18 : 22, borderRadius: 3,
        background: 'rgba(0,0,0,0.3)', border: `1px solid rgba(${GREEN_RGB},0.1)`,
      }}>
        {REACT_ARRIVALS.map((x, i) => (
          <span key={i} aria-hidden="true" style={{
            position: 'absolute', top: '50%', left: `calc(${x * 100}% - 2.5px)`,
            width: 5, height: 5, borderRadius: '50%', background: GREEN,
            boxShadow: `0 0 8px rgba(${GREEN_RGB},0.7)`,
            opacity: i < arrived ? 1 : 0,
            transform: i < arrived ? 'translateY(-50%) scale(1)' : 'translateY(-50%) scale(0)',
            transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease',
          }} />
        ))}
      </div>
      <span style={{ ...cellLabel, marginTop: 'auto', color: 'rgba(255,255,255,0.34)' }}>
        {arrived} accounts · first hour
      </span>
    </div>
  );
}

/* ── 05 · NeuroDialogs: a reply, written while you watch ── */
function DialogBody({ active, compact }) {
  const step = useStep(active, 700, 8);
  const incoming = compact ? 'what do you build?' : 'saw your comment — what do you actually build?';
  const outgoing = compact ? 'rollup tooling. you?' : 'mostly tooling around rollup infra. you?';
  const typing = step >= 2 && step < 4;
  const replied = step >= 4;

  const bubble = (out, text, on) => (
    <div style={{ display: 'flex', justifyContent: out ? 'flex-end' : 'flex-start' }}>
      <span style={{
        maxWidth: '94%', padding: '5px 8px', borderRadius: 4,
        background: out ? `rgba(${GREEN_RGB},0.1)` : 'rgba(255,255,255,0.05)',
        border: `1px solid ${out ? `rgba(${GREEN_RGB},0.24)` : 'rgba(255,255,255,0.08)'}`,
        fontFamily: 'Barlow, sans-serif', fontWeight: 300,
        fontSize: compact ? '0.66rem' : '0.72rem', lineHeight: 1.4,
        color: out ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)',
        opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(5px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
      }}>{text}</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, height: '100%', justifyContent: 'center' }}>
      {bubble(false, incoming, true)}
      {/* the typing row holds its height whether or not it is showing,
          so the thread never jumps as the reply lands */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: 12 }}>
        <span className={typing ? 'dots' : undefined} style={{
          ...cellLabel, color: `rgba(${GREEN_RGB},0.6)`,
          opacity: typing ? 1 : 0, transition: 'opacity 0.25s ease',
        }}>typing</span>
      </div>
      {bubble(true, outgoing, replied)}
    </div>
  );
}

const SHOWCASE_BODIES = {
  'channel-parser': ParserBody,
  'active-warmup': WarmupBody,
  'neurocommenting': CommentBody,
  'mass-reactions': ReactBody,
  'neurodialogs': DialogBody,
};

/* ── The card itself ── */
function EngineGrid({ setPage, compact }) {
  const ref = useRef(null);
  const onScreen = useOnScreen(ref);
  const [idx, setIdx] = useState(0);
  const [hover, setHover] = useState(null);
  const [pinned, setPinned] = useState(false);

  const focus = hover === null ? idx : hover;
  const auto = onScreen && !pinned && hover === null && !REDUCED_MOTION;

  useEffect(() => {
    if (!auto) return;
    const iv = setInterval(() => setIdx(i => (i + 1) % SHOWCASE.length), DWELL);
    return () => clearInterval(iv);
  }, [auto]);

  /* Clicking the tile that is already pinned hands the pipeline back. */
  const pick = i => {
    if (pinned && idx === i) { setPinned(false); return; }
    setIdx(i);
    setPinned(true);
  };

  const current = SHOWCASE[focus];
  const currentMod = MODULE_BY_KEY[current.key];
  const CurrentIcon = currentMod.icon;

  return (
    <div ref={ref} className="panel ticks" style={{ borderRadius: 6, padding: 0, overflow: 'hidden' }}>

      {/* header — the simulated marker sits here, read before the picture */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', flexWrap: 'wrap',
        borderBottom: `1px solid rgba(${GREEN_RGB},0.14)`, background: `rgba(${GREEN_RGB},0.04)`,
      }}>
        <span aria-hidden="true" style={{
          width: 7, height: 7, borderRadius: '50%', background: GREEN, flexShrink: 0,
          animation: REDUCED_MOTION ? 'none' : 'pulse-dot 1.8s ease-in-out infinite',
        }} />
        <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.64rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'white' }}>
          Inside the panel
        </span>
        <span style={{
          marginLeft: 'auto', fontFamily: MONO, fontWeight: 500, fontSize: '0.52rem',
          letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)',
          background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 3, padding: '4px 7px', lineHeight: 1, whiteSpace: 'nowrap',
        }}>{DEMO_LABEL}</span>
      </div>

      {/* the five modules */}
      <div role="group" aria-label="Module demos — simulated"
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: compact ? 8 : 10, padding: compact ? '12px 12px' : '14px 16px',
        }}>
        {SHOWCASE.map((s, i) => {
          const mod = MODULE_BY_KEY[s.key];
          const Icon = mod.icon;
          const Body = SHOWCASE_BODIES[s.key];
          const on = onScreen && focus === i;
          const isPinned = pinned && idx === i;
          return (
            <button key={s.key} type="button" className="eg-cell"
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)} onBlur={() => setHover(null)}
              onClick={() => pick(i)}
              aria-pressed={isPinned}
              aria-label={`${mod.name} — simulated example`}
              style={{
                gridColumn: s.wide ? 'span 2' : 'span 1',
                /* one height for the four small tiles, so the grid reads as a
                   grid rather than as four cards that happened to land near
                   each other — the tallest of them sets it */
                minHeight: s.wide ? (compact ? 152 : 140) : (compact ? 116 : 138),
                position: 'relative', overflow: 'hidden', textAlign: 'left',
                display: 'flex', flexDirection: 'column',
                padding: compact ? '9px 10px' : '10px 12px', borderRadius: 5,
                border: `1px solid rgba(${GREEN_RGB},${on ? 0.42 : 0.12})`,
                background: on
                  ? `linear-gradient(180deg, rgba(${GREEN_RGB},0.075), rgba(0,0,0,0.3))`
                  : 'rgba(0,0,0,0.26)',
                boxShadow: on ? `0 0 26px rgba(${GREEN_RGB},0.12)` : 'none',
                opacity: on ? 1 : 0.6,
                transition: 'border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease',
              }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: compact ? 7 : 9 }}>
                {!compact && (
                  <span style={{ ...cellLabel, flexShrink: 0, color: on ? `rgba(${GREEN_RGB},0.8)` : 'rgba(255,255,255,0.22)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                )}
                <Icon size={12} color={on ? GREEN : `rgba(${GREEN_RGB},0.5)`} />
                <span style={{
                  ...cellLabel, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  color: on ? 'white' : 'rgba(255,255,255,0.5)',
                }}>{mod.name}</span>
                {!compact && (
                  <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                    <span aria-hidden="true" style={{
                      width: 4, height: 4, borderRadius: '50%',
                      background: on ? GREEN : 'rgba(255,255,255,0.18)',
                      animation: on && !REDUCED_MOTION ? 'pulse-dot 1.8s ease-in-out infinite' : 'none',
                    }} />
                    <span style={{ ...cellLabel, fontSize: '0.46rem', color: on ? `rgba(${GREEN_RGB},0.7)` : 'rgba(255,255,255,0.2)' }}>
                      {s.status}
                    </span>
                  </span>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
                <Body active={on} compact={compact} />
              </div>
            </button>
          );
        })}
      </div>

      {/* what you are looking at, and the way into it */}
      <div style={{
        borderTop: `1px solid rgba(${GREEN_RGB},0.12)`, background: `rgba(${GREEN_RGB},0.03)`,
        padding: compact ? '13px 12px 12px' : '14px 16px 13px',
        display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap',
      }}>
        <div style={{ flex: '1 1 210px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <CurrentIcon size={13} color={GREEN} />
            <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'white' }}>
              {currentMod.name}
            </span>
            {pinned && (
              <span style={{ ...cellLabel, fontSize: '0.46rem', color: `rgba(${GREEN_RGB},0.6)` }}>pinned</span>
            )}
          </div>
          <p style={{
            fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem',
            lineHeight: 1.5, color: 'rgba(255,255,255,0.5)', minHeight: compact ? 48 : 36,
          }}>{current.line}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 7, marginLeft: 'auto' }}>
          <button type="button" className="quiet-link" onClick={() => setPage('functions', 'fn-' + current.key)}>
            Open module <ArrowUpRight size={11} />
          </button>
          <span style={{ ...cellLabel, fontSize: '0.46rem', color: 'rgba(255,255,255,0.26)', textAlign: 'right' }}>
            {compact ? 'Tap a module to replay it' : 'Hover to replay · click to pin'}
          </span>
        </div>
      </div>

      {/* dwell bar — shows the pipeline is running itself, and stops when you take over */}
      <div aria-hidden="true" style={{ height: 2, background: `rgba(${GREEN_RGB},0.08)` }}>
        {auto && (
          <div key={idx} className="eg-dwell" style={{
            height: '100%', background: `linear-gradient(90deg, rgba(${GREEN_RGB},0.5), var(--g-bright))`,
            animationDuration: DWELL + 'ms',
          }} />
        )}
      </div>
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
            <a href={window.withReferral('https://app.atreoxai.com')} target="_self" className="btn-solid cta-breathe" style={{ padding: '15px 28px', fontSize: '0.8rem' }}>
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

        {/* Right column — the five modules, each running its own demo */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
          style={{ flex: '1 1 420px', minWidth: 0 }}>
          <EngineGrid setPage={setPage} compact={isMobile} />
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

  /* Automation leads. It's what people are actually buying, and the old
     version of this list never once said the thing runs by itself.
     Dry run moved out to the Mass Reactions section on Functions, where
     it's a real feature rather than a top-six reason to trust anything. */
  const pillars = [
    { icon: Clock, title: 'You set it up once',
      body: 'About fifteen minutes: load accounts, pick channels, write a persona. Then press Start. It keeps running without you — no daily babysitting, no queue to top up.' },
    { icon: Shield, title: 'Accounts come first, always',
      body: 'Warmup before work. One proxy each. Its own rate budget. Hit a floodwait and the account pauses itself instead of grinding into a ban.' },
    { icon: Server, title: 'Two health checks, not one',
      body: "Telegram's own flags, plus a probe that resolves a real username and reads its history. That second one catches accounts that are frozen while every flag still looks clean." },
    { icon: Ban, title: 'Some topics it won\'t touch',
      body: "Death, war, violent crime, disasters, partisan politics — posts like that get skipped, not commented on. On by default for every persona. Turning it off is a choice you'd have to make on purpose." },
    { icon: Brain, title: 'Every action says why',
      body: 'Posted, skipped, rate-limited, failed — each tied to the post or thread it came from. When something stops, the log tells you. It never just goes quiet.' },
    { icon: Globe, title: 'Month to month',
      body: 'Cancel in the panel, keep access to the end of the period. Modules bill separately, so scaling down is dropping a line item, not starting over.' },
  ];

  return (
    <section ref={ref} className="section-block" style={{ padding: '88px 5%', maxWidth: 1280, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
        <SectionLockup title="Why trust it">
          It runs on its own — and Telegram automation fails in exactly one direction when it does:
          too fast, too uniform, too visible. Everything below exists because of that, and you can
          watch all of it while it works.
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
   5.5 — HOW IT COMPARES

   Placed right after Why Trust It on purpose: that section made the
   trust argument by looking inward (warmup, logging, caps). This one
   makes the same argument by looking outward — how the same claims
   read against the shape of tool most people already know. Sits
   before FAQ, which is where the remaining "but does it also—"
   questions belong.

   Rows are ATREOX capabilities only, each one checked against the
   engine the same way every other page in this pass was — nothing
   here is a feature the panel doesn't actually have.

   Marks for the other three columns describe TYPES of tool, not any
   named product, and follow one rule throughout: a cross is only used
   where the category is structurally unable to do the thing (an
   analytics service is read-only by definition, so it never posts,
   messages or reacts). Everywhere else that isn't confirmed either
   way gets a blank dash rather than a guess — see the caption under
   the table.
══════════════════════════════════════ */
const COMPARISON_COLUMNS = ['Bulk-messaging software', 'Analytics services', 'Standalone AI commenters'];

// marks: 'yes' | 'no' | null (null = not confirmed either way, shown as —)
const COMPARISON_ROWS = [
  { label: 'Writes a comment for that specific post, not a template',
    marks: ['no', 'no', 'yes'] },
  { label: 'Answers DMs in sessions, at a human pace — not instant, not 24/7',
    marks: [null, 'no', null] },
  { label: 'Reactions arrive on a human curve, not all at once',
    marks: [null, 'no', null] },
  { label: 'Builds an account\'s activity history before putting it to work',
    marks: [null, 'no', null] },
  { label: 'Checks account health two ways — platform flags and a real capability probe',
    marks: [null, 'no', null] },
  { label: 'Finds channels and groups by keyword, filtered by real recent activity',
    marks: ['no', 'yes', 'no'] },
  { label: 'Declines to comment on death, war, serious crime or politics — on by default',
    marks: [null, 'no', null] },
];

function CompareMark({ state }) {
  if (state === 'yes') return <Check size={14} color={GREEN} style={{ display: 'block', margin: '0 auto' }} />;
  if (state === 'no') return <X size={13} color="rgba(255,255,255,0.22)" style={{ display: 'block', margin: '0 auto' }} />;
  return (
    <span aria-label="not confirmed" title="Not something we could confirm either way"
      style={{ display: 'block', textAlign: 'center', fontFamily: MONO, color: 'rgba(255,255,255,0.24)', fontSize: '0.85rem' }}>
      –
    </span>
  );
}

function ComparisonSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  return (
    <section ref={ref} className="section-block" style={{ padding: '88px 5%', maxWidth: 1280, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
        <SectionLockup title="How it compares">
          ATREOX runs the whole pipeline — discovery, warmup, comments, DMs, reactions — from one panel.
          Here's how that stacks up against the kind of tool most people already have one of.
        </SectionLockup>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }}
        className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Wide on mobile — scrolls inside its own frame rather than the page. */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '18px 22px', fontFamily: MONO, fontWeight: 400, fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)', borderBottom: `1px solid rgba(${GREEN_RGB},0.14)` }}>
                  What it does
                </th>
                <th style={{
                  padding: '18px 20px', minWidth: 108,
                  fontFamily: MONO, fontWeight: 600, fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: GREEN,
                  background: `rgba(${GREEN_RGB},0.06)`,
                  borderBottom: `1px solid rgba(${GREEN_RGB},0.4)`, borderLeft: `1px solid rgba(${GREEN_RGB},0.3)`, borderRight: `1px solid rgba(${GREEN_RGB},0.3)`,
                }}>
                  ATREOX
                </th>
                {COMPARISON_COLUMNS.map(col => (
                  <th key={col} style={{
                    padding: '18px 16px', minWidth: 128, textAlign: 'center',
                    fontFamily: MONO, fontWeight: 500, fontSize: '0.62rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)',
                    borderBottom: `1px solid rgba(${GREEN_RGB},0.14)`,
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr key={row.label}>
                  <td style={{
                    padding: '17px 22px', fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.68)', lineHeight: 1.5,
                    borderBottom: i === COMPARISON_ROWS.length - 1 ? 'none' : `1px solid rgba(${GREEN_RGB},0.08)`,
                  }}>
                    {row.label}
                  </td>
                  <td style={{
                    padding: '17px 20px', textAlign: 'center',
                    background: `rgba(${GREEN_RGB},0.045)`,
                    borderLeft: `1px solid rgba(${GREEN_RGB},0.3)`, borderRight: `1px solid rgba(${GREEN_RGB},0.3)`,
                    borderBottom: i === COMPARISON_ROWS.length - 1 ? `1px solid rgba(${GREEN_RGB},0.3)` : `1px solid rgba(${GREEN_RGB},0.14)`,
                  }}>
                    <CompareMark state="yes" />
                  </td>
                  {row.marks.map((m, j) => (
                    <td key={j} style={{
                      padding: '17px 16px', textAlign: 'center',
                      borderBottom: i === COMPARISON_ROWS.length - 1 ? 'none' : `1px solid rgba(${GREEN_RGB},0.08)`,
                    }}>
                      <CompareMark state={m} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <p style={{ marginTop: 16, fontFamily: MONO, fontWeight: 400, fontSize: '0.62rem', letterSpacing: '0.04em', color: 'rgba(255,255,255,0.28)', lineHeight: 1.7 }}>
        — means we don't have confirmed information either way for that category, so we're not claiming it. ✕ is only used
        where the category can't structurally do the thing — an analytics service is read-only, for instance.
      </p>
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
    { q: 'Is it really automated?',
      a: "Yes. Setting it up takes about fifteen minutes — load your accounts, choose the channels, write the persona. After that you press Start in Neurocommenting and it goes: it watches for new posts, writes a comment under each one, waits out its own delays and keeps itself inside its rate limits. You don't feed it anything. You come back to read the log and collect the traffic." },
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
   6.5 — FOLLOW
   The channel and the videos, given room rather than left as two
   glyphs in the navbar. Sits after the FAQ: someone still reading by
   here wants more of this, and it's the cheapest thing to say yes to.
══════════════════════════════════════ */
function SocialSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  return (
    <section ref={ref} className="section-block" style={{ padding: '20px 5% 88px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
        {SOCIAL_LINKS.map(({ key, label, icon: Icon, href, blurb }, i) => (
          <motion.a key={key} href={href} target="_blank" rel="noopener noreferrer"
            className="panel panel-hover"
            initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            style={{ padding: '30px 28px', display: 'flex', gap: 18, alignItems: 'flex-start', textDecoration: 'none' }}>
            <span aria-hidden="true" style={{
              width: 46, height: 46, borderRadius: 5, flexShrink: 0,
              background: `rgba(${GREEN_RGB},0.08)`, border: `1px solid rgba(${GREEN_RGB},0.22)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={21} color={GREEN} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '1rem', color: 'white' }}>{label}</span>
                <ArrowUpRight size={14} color={`rgba(${GREEN_RGB},0.6)`} />
              </span>
              <span style={{ display: 'block', fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.87rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
                {blurb}
              </span>
            </span>
          </motion.a>
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
        {/* Was "Ready to grow on Telegram?" — a question whose honest answer
            can be "no", asked at the exact moment you want a decision. It's a
            statement now, and the buttons name the next action rather than a
            page. */}
        <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(1.9rem, 4.2vw, 3.1rem)', color: 'white', letterSpacing: '-0.01em', lineHeight: 1.1, marginBottom: 16 }}>
          Build your licence in two minutes.
        </h2>
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.55)', maxWidth: 460, margin: '0 auto 36px', lineHeight: 1.65 }}>
          Tick the modules you'll actually run and the total adds itself up. Account Manager and
          Profile Templates are in there free, whatever else you choose.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-solid" onClick={() => setPage('pricing')} style={{ padding: '15px 32px', fontSize: '0.82rem' }}>
            Choose your modules <ArrowUpRight size={15} />
          </button>
          <a href={window.withReferral('https://app.atreoxai.com')} target="_self" className="btn-outline" style={{ padding: '14px 28px' }}>
            Open the panel <ArrowUpRight size={14} />
          </a>
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
      <ComparisonSection />
      <FAQSection setPage={setPage} />
      <SocialSection />
      <CtaBannerSection setPage={setPage} />
      <CrossLinks current="home" setPage={setPage} />
      <div style={{ padding: '0 5% 60px' }}>
        <FooterBar setPage={setPage} />
      </div>
    </div>
  );
}

Object.assign(window, { HomePage });
