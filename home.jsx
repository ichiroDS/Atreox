
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
const DWELL = 3900;                        /* ms a stage holds before the pipeline moves on */

const SHOWCASE = [
  /* Order is editorial: the two the visitor is here for first, then the
     six that keep them running. The first two take a double-width tile
     because a written comment and a written reply are the only two
     demos on the card that are sentences. */
  { key: 'neurocommenting', status: 'writing',  wide: true,
    line: 'Writes a comment against each new post, not a template.' },
  { key: 'neurodialogs',    status: 'replying', wide: true,
    line: 'Answers a DM from the thread so far, not the last line.' },
  { key: 'channel-parser',  status: 'scanning',
    line: 'Finds the channels your audience already reads.' },
  { key: 'group-parser',    status: 'probing',
    line: 'Finds rooms with a real conversation in them.' },
  { key: 'account-manager', status: 'checking',
    line: 'Two health checks catch the account that only looks alive.' },
  { key: 'active-warmup',   status: 'warming',
    line: 'Builds a history on an account before it ever posts.' },
  { key: 'mass-reactions',  status: 'reacting',
    line: 'Reactions arrive on a human curve, not all at once.' },
  { key: 'profile-templates', status: 'applying',
    line: 'One face and one bio, rolled across a whole batch.' },
];

/* Type scale for the tiles. Kept in one place because the whole card
   lives or dies on these being legible — everything here is a step up
   from the mono captions used elsewhere on the page, not down. */
const lbl = c => ({
  fontFamily: MONO, fontWeight: 500, fontSize: c ? '0.54rem' : '0.58rem',
  letterSpacing: '0.13em', textTransform: 'uppercase',
});
const txt = c => ({ fontFamily: MONO, fontWeight: 400, fontSize: c ? '0.62rem' : '0.68rem' });
const prose = c => ({
  fontFamily: 'Barlow, sans-serif', fontWeight: 300,
  fontSize: c ? '0.72rem' : '0.82rem', lineHeight: 1.45,
});

const DIM = 'rgba(255,255,255,0.5)';
const MID = 'rgba(255,255,255,0.72)';
const WARN = 'rgba(255,196,92,0.9)';

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

/* A row that fades up as the demo reaches it — the shared movement of
   every list tile on the card. */
function Row({ shown, children, gap }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: gap || 7,
      opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateY(5px)',
      transition: 'opacity 0.35s ease, transform 0.35s ease',
    }}>{children}</div>
  );
}

function ScanLine({ on }) {
  if (!on || REDUCED_MOTION) return null;
  return (
    <span aria-hidden="true" className="eg-scan" style={{
      position: 'absolute', left: -14, right: -14, height: 1,
      background: `linear-gradient(90deg, transparent, rgba(${GREEN_RGB},0.8), transparent)`,
    }} />
  );
}

/* ── Neurocommenting: a post, and the comment written for it ── */
const COMMENT_DEMOS = [
  { channel: '@Web3BuildersHub',
    post: 'Gas on the new L2 dropped 60% after the upgrade 👇',
    postSm: 'Gas on the new L2 dropped 60% 👇',
    reply: '60% is wild — does it hold under load?',
    replySm: '60% is wild — under load too?' },
  { channel: '@AITradingSignals',
    post: 'Backtest for the momentum model held up.',
    postSm: 'Backtest held through the chop.',
    reply: 'what window is that on? flat months too?',
    replySm: 'what window is that on?' },
];

function CommentBody({ active, compact }) {
  const [pair, setPair] = useState(0);
  const [typed, setTyped] = useState(0);
  const demo = COMMENT_DEMOS[pair % COMMENT_DEMOS.length];
  const reply = compact ? demo.replySm : demo.reply;
  const full = reply.length;

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
  const text = live ? reply.slice(0, typed) : reply;
  const done = text.length >= full;
  /* Reserved height, so the tile does not breathe as the reply types
     itself out — a floor and a ceiling rather than a fixed height, so a
     width this was not sized for wraps instead of losing the sentence. */
  const line = { ...prose(compact), minHeight: compact ? 34 : 24, maxHeight: compact ? 34 : 48, overflow: 'hidden' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 8 : 11, height: '100%' }}>
      <div>
        <span style={{ ...lbl(compact), display: 'block', marginBottom: 4, color: DIM, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Post · {demo.channel}
        </span>
        <p style={{ ...line, color: MID }}>{compact ? demo.postSm : demo.post}</p>
      </div>
      <div style={{ borderTop: `1px solid rgba(${GREEN_RGB},0.14)`, paddingTop: compact ? 8 : 11 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ ...lbl(compact), color: `rgba(${GREEN_RGB},0.85)`, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Comment · acct_0148
          </span>
          <span style={{
            ...lbl(compact), marginLeft: 'auto', fontWeight: 600, flexShrink: 0,
            color: done ? GREEN : 'rgba(255,255,255,0.4)', transition: 'color 0.3s ease',
          }}>{done ? 'sent' : 'writing'}</span>
        </div>
        <p style={{ ...line, color: 'rgba(255,255,255,0.94)' }}>
          {text}
          {live && !done && <span className="cursor" style={{ width: 5, height: '0.72em', marginLeft: 3 }} />}
        </p>
      </div>
    </div>
  );
}

/* ── NeuroDialogs: a reply, written while you watch ── */
function DialogBody({ active, compact }) {
  const step = useStep(active, 700, 8);
  const incoming = compact ? 'what do you actually build?' : 'saw your comment in the L2 thread — what do you actually build?';
  const outgoing = compact ? 'mostly rollup tooling. you?' : 'mostly tooling around rollup infra. what are you working on?';
  const typing = step >= 2 && step < 4;
  const replied = step >= 4;

  const bubble = (out, text, on) => (
    <div style={{ display: 'flex', justifyContent: out ? 'flex-end' : 'flex-start' }}>
      <span style={{
        maxWidth: '92%', padding: compact ? '6px 9px' : '8px 11px', borderRadius: 5,
        background: out ? `rgba(${GREEN_RGB},0.13)` : 'rgba(255,255,255,0.06)',
        border: `1px solid ${out ? `rgba(${GREEN_RGB},0.3)` : 'rgba(255,255,255,0.1)'}`,
        ...prose(compact),
        color: out ? 'rgba(255,255,255,0.94)' : MID,
        opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(5px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
      }}>{text}</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, height: '100%', justifyContent: 'center' }}>
      {bubble(false, incoming, true)}
      {/* the typing row holds its height whether or not it is showing,
          so the thread never jumps as the reply lands */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: 14 }}>
        <span className={typing ? 'dots' : undefined} style={{
          ...lbl(compact), color: `rgba(${GREEN_RGB},0.75)`,
          opacity: typing ? 1 : 0, transition: 'opacity 0.25s ease',
        }}>typing</span>
      </div>
      {bubble(true, outgoing, replied)}
    </div>
  );
}

/* ── Channel Parser: candidates land, then get judged ── */
function ParserBody({ active, compact }) {
  const step = useStep(active, 620, 9);
  const rows = [
    ['@CryptoAlphaCalls', true],
    ['@DeadSignalsDaily', false],
    ['@Web3BuildersHub', true],
  ];
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: compact ? 4 : 6, height: '100%' }}>
      <ScanLine on={active} />
      {rows.map(([name, ok], i) => {
        const judged = step >= i + 2;
        return (
          <Row key={name} shown={step >= i}>
            <span style={{
              ...txt(compact), flex: '1 1 auto', minWidth: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              color: judged ? (ok ? GREEN : 'rgba(255,255,255,0.34)') : MID,
              transition: 'color 0.35s ease',
            }}>{name}</span>
            <span style={{
              ...lbl(compact), fontWeight: 600, flexShrink: 0,
              color: ok ? GREEN : 'rgba(255,120,120,0.75)',
              opacity: judged ? 1 : 0, transition: 'opacity 0.3s ease',
            }}>{ok ? 'keep' : 'drop'}</span>
          </Row>
        );
      })}
      <span style={{ ...lbl(compact), marginTop: 'auto', color: `rgba(${GREEN_RGB},0.7)` }}>
        {step >= 5 ? '5 kept of 19' : 'evaluating'}
      </span>
    </div>
  );
}

/* ── Group Parser: the metric that separates a room from a number ── */
function GroupParserBody({ active, compact }) {
  const step = useStep(active, 600, 9);
  const rows = [
    ['@BuildersLounge', 84, true],
    ['@AlphaChatRoom', 6, false],
    ['@AICreatorsTalk', 61, true],
  ];
  const grow = Math.min(1, (step + 1) / 5);
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: compact ? 4 : 6, height: '100%' }}>
      <ScanLine on={active} />
      {rows.map(([name, senders, ok], i) => {
        const judged = step >= i + 2;
        return (
          <Row key={name} shown={step >= i}>
            <span style={{
              ...txt(compact), flex: '1 1 auto', minWidth: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              color: judged ? (ok ? GREEN : 'rgba(255,255,255,0.34)') : MID,
              transition: 'color 0.35s ease',
            }}>{name}</span>
            <span style={{ ...txt(compact), flexShrink: 0, color: ok ? MID : 'rgba(255,255,255,0.34)' }}>
              {Math.round(senders * grow)}
            </span>
          </Row>
        );
      })}
      <span style={{ ...lbl(compact), marginTop: 'auto', color: `rgba(${GREEN_RGB},0.7)` }}>
        unique senders · 7d
      </span>
    </div>
  );
}

/* ── Account Manager: the second check is the one that finds things ── */
function AccountsBody({ active, compact }) {
  const step = useStep(active, 640, 9);
  const rows = [
    ['acct_0148', 'active', GREEN],
    ['acct_0151', 'floodwait', WARN],
    ['acct_0152', 'active', GREEN],
  ];
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: compact ? 4 : 6, height: '100%' }}>
      <ScanLine on={active} />
      {rows.map(([id, state, colour], i) => {
        const done = step >= i + 2;
        return (
          <Row key={id} shown={step >= i}>
            <span style={{ ...txt(compact), color: MID, flexShrink: 0 }}>{id}</span>
            <span style={{
              ...lbl(compact), marginLeft: 'auto', flexShrink: 0,
              color: done ? colour : 'rgba(255,255,255,0.34)', transition: 'color 0.35s ease',
            }}>{done ? state : 'checking'}</span>
          </Row>
        );
      })}
      <span style={{ ...lbl(compact), marginTop: 'auto', color: `rgba(${GREEN_RGB},0.7)` }}>
        flags + capability probe
      </span>
    </div>
  );
}

/* ── Active Warmup: accounts filling their day's activity ── */
function WarmupBody({ active, compact }) {
  const step = useStep(active, 520, 10);
  const acts = ['reading', 'joined', 'reacted', 'resting'];
  const rows = [['acct_0148', 94], ['acct_0149', 71], ['acct_0150', 46]];
  const grow = Math.min(1, (step + 1) / 6);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 6 : 7, height: '100%', justifyContent: 'center' }}>
      {rows.map(([id, target], i) => (
        <div key={id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ ...txt(compact), color: MID, flexShrink: 0 }}>{id}</span>
            <span style={{
              ...lbl(compact), marginLeft: 'auto', minWidth: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              color: `rgba(${GREEN_RGB},0.85)`,
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

/* ── Mass Reactions: the arrival curve, in miniature ──
   Positions are clustered early and thinned out after, the shape the
   engine's own human curve produces — see the Functions page demo. */
const REACT_ARRIVALS = [0.05, 0.08, 0.12, 0.16, 0.21, 0.27, 0.34, 0.42, 0.52, 0.64, 0.78, 0.93];

function ReactBody({ active, compact }) {
  const step = useStep(active, 360, 15);
  const chips = [['🔥', 24], ['👍', 17], ['🚀', 11]];
  const arrived = Math.min(REACT_ARRIVALS.length, step + 1);
  const share = arrived / REACT_ARRIVALS.length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 8 : 10, height: '100%' }}>
      <div style={{ display: 'flex', gap: 5 }}>
        {chips.map(([emoji, n]) => (
          <span key={emoji} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 7px', borderRadius: 3,
            border: `1px solid rgba(${GREEN_RGB},0.26)`, background: `rgba(${GREEN_RGB},0.08)`,
            fontFamily: MONO, fontWeight: 500, fontSize: compact ? '0.58rem' : '0.62rem',
            lineHeight: 1, color: 'rgba(255,255,255,0.88)',
          }}>
            <span style={{ fontSize: compact ? '0.68rem' : '0.74rem' }}>{emoji}</span>{Math.max(1, Math.round(n * share))}
          </span>
        ))}
      </div>
      <div style={{
        position: 'relative', height: compact ? 20 : 24, borderRadius: 3,
        background: 'rgba(0,0,0,0.45)', border: `1px solid rgba(${GREEN_RGB},0.14)`,
      }}>
        {REACT_ARRIVALS.map((x, i) => (
          <span key={i} aria-hidden="true" style={{
            position: 'absolute', top: '50%', left: `calc(${x * 100}% - 2.5px)`,
            width: 5, height: 5, borderRadius: '50%', background: GREEN,
            boxShadow: `0 0 9px rgba(${GREEN_RGB},0.85)`,
            opacity: i < arrived ? 1 : 0,
            transform: i < arrived ? 'translateY(-50%) scale(1)' : 'translateY(-50%) scale(0)',
            transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease',
          }} />
        ))}
      </div>
      <span style={{ ...lbl(compact), marginTop: 'auto', color: `rgba(${GREEN_RGB},0.7)` }}>
        {arrived} accounts · first hour
      </span>
    </div>
  );
}

/* ── Profile Templates: one face, rolled across a batch ── */
function TemplatesBody({ active, compact }) {
  const step = useStep(active, 620, 8);
  const people = [['MK', 'Mia K.'], ['DR', 'Dan R.'], ['AS', 'Ana S.']];
  const done = Math.min(people.length, Math.max(0, step));
  const size = compact ? 26 : 30;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 9 : 11, height: '100%' }}>
      <div style={{ display: 'flex', gap: 7 }}>
        {people.map(([initials], i) => {
          const on = i < done;
          return (
            <span key={initials} aria-hidden="true" style={{
              width: size, height: size, borderRadius: '50%', flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: MONO, fontWeight: 600, fontSize: compact ? '0.54rem' : '0.58rem',
              border: `1px solid rgba(${GREEN_RGB},${on ? 0.55 : 0.16})`,
              background: on ? `rgba(${GREEN_RGB},0.14)` : 'rgba(255,255,255,0.03)',
              color: on ? GREEN : 'rgba(255,255,255,0.2)',
              boxShadow: on ? `0 0 14px rgba(${GREEN_RGB},0.25)` : 'none',
              transform: on ? 'scale(1)' : 'scale(0.86)',
              transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
            }}>{initials}</span>
          );
        })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {people.slice(0, 1).map(([initials, name], i) => (
          <Row key={initials} shown={i < done}>
            <span style={{ ...txt(compact), color: MID, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
            <span style={{ ...lbl(compact), marginLeft: 'auto', color: `rgba(${GREEN_RGB},0.85)`, flexShrink: 0 }}>set</span>
          </Row>
        ))}
      </div>
      <span style={{ ...lbl(compact), marginTop: 'auto', color: `rgba(${GREEN_RGB},0.7)` }}>
        {done} of 12 applied
      </span>
    </div>
  );
}

const SHOWCASE_BODIES = {
  'neurocommenting': CommentBody,
  'neurodialogs': DialogBody,
  'channel-parser': ParserBody,
  'group-parser': GroupParserBody,
  'account-manager': AccountsBody,
  'active-warmup': WarmupBody,
  'mass-reactions': ReactBody,
  'profile-templates': TemplatesBody,
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
    <div ref={ref} className="ticks" style={{
      position: 'relative', borderRadius: 7, overflow: 'hidden',
      border: `1px solid rgba(${GREEN_RGB},0.26)`,
      background: 'linear-gradient(180deg, rgba(3,12,18,0.94) 0%, rgba(0,2,4,0.96) 100%)',
      boxShadow: `0 40px 90px rgba(0,0,0,0.6), 0 0 0 1px rgba(${GREEN_RGB},0.05), 0 0 70px rgba(${GREEN_RGB},0.07)`,
    }}>
      {/* hairline sheen along the top edge — the thing that stops a dark
          rectangle from reading as a flat placeholder */}
      <span aria-hidden="true" style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, rgba(${GREEN_RGB},0.55), transparent)`,
      }} />

      {/* header — the simulated marker sits here, read before the picture */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: compact ? '13px 14px' : '15px 18px', flexWrap: 'wrap',
        borderBottom: `1px solid rgba(${GREEN_RGB},0.16)`, background: `rgba(${GREEN_RGB},0.045)`,
      }}>
        <span aria-hidden="true" style={{
          width: 7, height: 7, borderRadius: '50%', background: GREEN, flexShrink: 0,
          boxShadow: `0 0 10px rgba(${GREEN_RGB},0.9)`,
          animation: REDUCED_MOTION ? 'none' : 'pulse-dot 1.8s ease-in-out infinite',
        }} />
        <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: compact ? '0.62rem' : '0.68rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'white' }}>
          Inside the panel
        </span>
        <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: compact ? '0.56rem' : '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: `rgba(${GREEN_RGB},0.75)` }}>
          · 8 modules
        </span>
        <span style={{
          marginLeft: 'auto', fontFamily: MONO, fontWeight: 500, fontSize: '0.54rem',
          letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)',
          background: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.24)',
          borderRadius: 3, padding: '4px 8px', lineHeight: 1, whiteSpace: 'nowrap',
        }}>{DEMO_LABEL}</span>
      </div>

      {/* the eight modules */}
      <div role="group" aria-label="Module demos — simulated"
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
          gap: compact ? 8 : 10, padding: compact ? 12 : 16,
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
                /* six columns: the two sentence tiles take half a row each,
                   the six data tiles take a third. On a phone everything
                   halves, which keeps it two-up instead of a tall stack. */
                gridColumn: compact ? 'span 3' : (s.wide ? 'span 3' : 'span 2'),
                minHeight: compact ? (s.wide ? 136 : 116) : (s.wide ? 150 : 140),
                position: 'relative', overflow: 'hidden', textAlign: 'left',
                display: 'flex', flexDirection: 'column',
                padding: compact ? '10px 11px' : '12px 14px', borderRadius: 5,
                border: `1px solid rgba(${GREEN_RGB},${on ? 0.5 : 0.14})`,
                background: on
                  ? `linear-gradient(180deg, rgba(${GREEN_RGB},0.1), rgba(0,0,0,0.5))`
                  : 'rgba(0,0,0,0.45)',
                boxShadow: on ? `0 0 30px rgba(${GREEN_RGB},0.16), inset 0 1px 0 rgba(${GREEN_RGB},0.18)` : 'none',
                opacity: on ? 1 : 0.82,
                transition: 'border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease',
              }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: compact ? 9 : 11 }}>
                <Icon size={compact ? 13 : 14} color={on ? GREEN : `rgba(${GREEN_RGB},0.7)`} />
                <span style={{
                  ...lbl(compact), minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  color: on ? 'white' : 'rgba(255,255,255,0.74)',
                }}>{mod.name}</span>
                {/* the state word only fits beside the name on the two
                    double-width tiles; the six others keep the pulse on
                    its own and say what they are doing in their caption */}
                <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                  <span aria-hidden="true" style={{
                    width: 4, height: 4, borderRadius: '50%',
                    background: on ? GREEN : 'rgba(255,255,255,0.3)',
                    animation: on && !REDUCED_MOTION ? 'pulse-dot 1.8s ease-in-out infinite' : 'none',
                  }} />
                  {s.wide && !compact && (
                    <span style={{ ...lbl(compact), fontSize: '0.52rem', color: on ? `rgba(${GREEN_RGB},0.85)` : 'rgba(255,255,255,0.4)' }}>
                      {s.status}
                    </span>
                  )}
                </span>
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
        borderTop: `1px solid rgba(${GREEN_RGB},0.16)`, background: `rgba(${GREEN_RGB},0.04)`,
        padding: compact ? '14px 14px 13px' : '16px 18px 15px',
        display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap',
      }}>
        <div style={{ flex: '1 1 230px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
            <CurrentIcon size={14} color={GREEN} />
            <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.64rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'white' }}>
              {currentMod.name}
            </span>
            <span style={{ ...lbl(compact), fontSize: '0.52rem', color: currentMod.included ? 'rgba(255,255,255,0.42)' : `rgba(${GREEN_RGB},0.8)` }}>
              {currentMod.included ? 'included' : `${eur(currentMod.price)}/mo`}
            </span>
            {pinned && <span style={{ ...lbl(compact), fontSize: '0.5rem', color: 'rgba(255,255,255,0.42)' }}>pinned</span>}
          </div>
          <p style={{
            fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.86rem',
            lineHeight: 1.5, color: 'rgba(255,255,255,0.62)', minHeight: compact ? 52 : 26,
          }}>{current.line}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, marginLeft: 'auto' }}>
          <button type="button" className="quiet-link" onClick={() => setPage('functions', 'fn-' + current.key)}>
            Open module <ArrowUpRight size={12} />
          </button>
          <span style={{ ...lbl(compact), fontSize: '0.5rem', color: 'rgba(255,255,255,0.38)', textAlign: 'right' }}>
            {compact ? 'Tap a module to replay it' : 'Hover to replay · click to pin'}
          </span>
        </div>
      </div>

      {/* dwell bar — shows the pipeline is running itself, and stops when you take over */}
      <div aria-hidden="true" style={{ height: 2, background: `rgba(${GREEN_RGB},0.1)` }}>
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
      {/* The hero runs wider than the 1280 the rest of the page sits in —
          the card needs the room for eight modules, and widening the whole
          block rather than just the card keeps the pair centred on the same
          axis instead of pushing the copy off to one side. */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1460, margin: '0 auto', padding: isMobile ? '110px 5% 40px' : '142px 4% 76px', display: 'flex', gap: isMobile ? 32 : 60, alignItems: 'center', flexWrap: 'wrap' }}>

        {/* Left column */}
        <div style={{ flex: '1 1 430px', minWidth: 0 }}>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="overline" style={{ display: 'block', marginBottom: 22 }}>
            {'// '}<TypeText text="The ultimate Telegram growth engine" startDelay={1200} /><span className="cursor" />
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
            style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.7rem', color: 'rgba(255,255,255,0.46)', letterSpacing: '0.08em', lineHeight: 1.7 }}>
            Built for: crypto, AI & tech creators — and anyone growing a Telegram funnel · English-language market · 24/7 automation
          </motion.p>
        </div>

        {/* Right column — the eight modules, each running its own demo */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
          style={{ flex: '1 1 560px', minWidth: 0 }}>
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
                  <span style={{ display: 'block', fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.84rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.6 }}>{b}</span>
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
        <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.62rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)' }}>{title}</span>
        {right && <span style={{ marginLeft: 'auto', fontFamily: MONO, fontWeight: 400, fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>{right}</span>}
      </div>
      <div style={{ padding: '4px 0' }}>{children}</div>
    </div>
  );
}

const mockRow = {
  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px',
  fontFamily: MONO, fontSize: '0.7rem', fontWeight: 400,
};

function Verdict({ ok, children }) {
  return (
    <span style={{
      flexShrink: 0, fontFamily: MONO, fontWeight: 600, fontSize: '0.57rem',
      letterSpacing: '0.12em', textTransform: 'uppercase',
      color: ok ? GREEN : 'rgba(255,255,255,0.45)',
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
        <span style={{ display: 'block', fontFamily: MONO, fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 7 }}>Post · @Web3BuildersHub</span>
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
          <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)' }}>reply in 41s</span>
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
        <span style={{ display: 'block', fontFamily: MONO, fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 8 }}>Target · @CryptoAlphaCalls · post 4812</span>
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
            <span style={{ display: 'block', fontFamily: MONO, fontWeight: 500, fontSize: '0.6rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 12 }}>
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
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.88rem', color: 'rgba(255,255,255,0.62)', lineHeight: 1.7 }}>{body}</p>
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
   named product. See the note on COMPARISON_ROWS for the rule they
   follow and where it is now surfaced to the reader.
══════════════════════════════════════ */
const COMPARISON_COLUMNS = ['Bulk senders', 'Analytics tools', 'AI commenters'];

/* Rows are short on purpose: a comparison table is scanned, not read,
   and the full sentence for every one of these lives on Functions.

   marks: 'yes' | 'no' | null.
   The rule behind them has not changed — a cross is only used where the
   category structurally cannot do the thing (an analytics service is
   read-only, so it never posts, messages or reacts), and anything we
   could not confirm either way is left as an amber dash rather than
   guessed at. The dash carries that as a tooltip instead of the
   footnote that used to sit under the table. */
const COMPARISON_ROWS = [
  { label: 'AI comments written per post',      marks: ['no', 'no', 'yes'] },
  { label: 'DM replies at a human pace',        marks: [null, 'no', null] },
  { label: 'Reactions on a human curve',        marks: [null, 'no', null] },
  { label: 'Account warmup before work',        marks: [null, 'no', null] },
  { label: 'Two-way account health checks',     marks: [null, 'no', null] },
  { label: 'Channel & group discovery',         marks: ['no', 'yes', 'no'] },
  { label: 'Sensitive-topic filter, on by default', marks: [null, 'no', null] },
  { label: 'Every module in one panel',         marks: ['no', 'no', 'no'] },
];

/* Traffic-light marks rather than accent-coloured ones: yes / no /
   unconfirmed have to be told apart at a glance, and three shades of
   the brand cyan cannot do that. The green is pulled cool and the amber
   pulled down so neither fights the palette around them. */
const MARK_TONE = {
  yes:  { ring: 'rgba(62,224,164,0.45)', fill: 'rgba(62,224,164,0.13)', ink: 'rgb(62,224,164)',    glow: '0 0 14px rgba(62,224,164,0.25)' },
  no:   { ring: 'rgba(255,96,96,0.34)',  fill: 'rgba(255,96,96,0.10)',  ink: 'rgba(255,122,122,0.9)', glow: 'none' },
  null: { ring: 'rgba(226,178,80,0.3)',  fill: 'rgba(226,178,80,0.08)', ink: 'rgba(226,186,104,0.85)', glow: 'none' },
};

/* One badge, three states. Sized so the column reads as a row of marks
   at a glance rather than three different glyph weights. */
function CompareMark({ state, big }) {
  const tone = MARK_TONE[state === null ? 'null' : state];
  const d = big ? 30 : 26;
  const title = state === 'yes' ? 'Yes'
    : state === 'no' ? 'No — the category cannot structurally do this'
    : 'Not something we could confirm either way';
  return (
    <span title={title} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: d, height: d, borderRadius: '50%',
      border: `1px solid ${tone.ring}`, background: tone.fill, boxShadow: tone.glow,
    }}>
      {state === 'yes' && <Check size={big ? 15 : 13} color={tone.ink} />}
      {state === 'no' && <X size={big ? 13 : 12} color={tone.ink} />}
      {state === null && <span aria-hidden="true" style={{ width: big ? 11 : 9, height: 1.5, background: tone.ink, borderRadius: 1 }} />}
      <span style={{
        position: 'absolute', width: 1, height: 1, overflow: 'hidden',
        clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap',
      }}>{title}</span>
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
          ATREOX runs the whole pipeline from one panel. Here's how that stacks up against the kind of
          tool most people already have one of.
        </SectionLockup>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }}
        className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Wide on mobile — scrolls inside its own frame rather than the page. */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 660, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '20px 24px', fontFamily: MONO, fontWeight: 500, fontSize: '0.64rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', borderBottom: `1px solid rgba(${GREEN_RGB},0.16)` }}>
                  Feature
                </th>
                <th style={{
                  padding: '16px 20px', minWidth: 124,
                  background: `rgba(${GREEN_RGB},0.07)`,
                  borderBottom: `1px solid rgba(${GREEN_RGB},0.45)`, borderLeft: `1px solid rgba(${GREEN_RGB},0.32)`, borderRight: `1px solid rgba(${GREEN_RGB},0.32)`,
                }}>
                  <span style={{ display: 'block', fontFamily: MONO, fontWeight: 600, fontSize: '0.78rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: GREEN, textShadow: `0 0 20px rgba(${GREEN_RGB},0.4)` }}>
                    ATREOX
                  </span>
                  <span style={{ display: 'block', marginTop: 5, fontFamily: MONO, fontWeight: 400, fontSize: '0.54rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>
                    All eight modules
                  </span>
                </th>
                {COMPARISON_COLUMNS.map(col => (
                  <th key={col} style={{
                    padding: '20px 16px', minWidth: 130, textAlign: 'center',
                    fontFamily: MONO, fontWeight: 500, fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.58)',
                    borderBottom: `1px solid rgba(${GREEN_RGB},0.16)`,
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => {
                const last = i === COMPARISON_ROWS.length - 1;
                return (
                  <tr key={row.label} className="cmp-row">
                    <td style={{
                      padding: '15px 24px', fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.95rem', color: 'rgba(255,255,255,0.88)', lineHeight: 1.4,
                      borderBottom: last ? 'none' : `1px solid rgba(${GREEN_RGB},0.09)`,
                    }}>
                      {row.label}
                    </td>
                    <td style={{
                      padding: '15px 20px', textAlign: 'center',
                      background: `rgba(${GREEN_RGB},0.055)`,
                      borderLeft: `1px solid rgba(${GREEN_RGB},0.32)`, borderRight: `1px solid rgba(${GREEN_RGB},0.32)`,
                      borderBottom: last ? `1px solid rgba(${GREEN_RGB},0.32)` : `1px solid rgba(${GREEN_RGB},0.16)`,
                    }}>
                      <CompareMark state="yes" big />
                    </td>
                    {row.marks.map((m, j) => (
                      <td key={j} style={{
                        padding: '15px 16px', textAlign: 'center',
                        borderBottom: last ? 'none' : `1px solid rgba(${GREEN_RGB},0.09)`,
                      }}>
                        <CompareMark state={m} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
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
   3.5 — FOLLOW
   The channel and the videos, given room rather than left as two
   glyphs in the navbar. Sits between the pipeline and the price: the
   visitor has just seen how it runs, and following is the cheapest
   yes on the page to say before being asked for money.
══════════════════════════════════════ */
function SocialSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  return (
    <section ref={ref} className="section-block" style={{ padding: '20px 5% 60px', maxWidth: 1280, margin: '0 auto' }}>
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
      <SocialSection />
      <PriceTeaserSection setPage={setPage} />
      <TrustSection setPage={setPage} />
      <ComparisonSection />
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
