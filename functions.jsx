
/* ══════════════════════════════════════════════════════════════════
   functions.jsx — the page that sells.

   One section per module, in the order the pipeline runs them. Each
   answers the four questions someone deciding whether to pay actually
   has: what it does, what problem it solves, how it works in practice,
   and what you can actually change. Every section ends where the two
   other pages start — the guide that teaches it, the price that buys it.
══════════════════════════════════════════════════════════════════ */

const React = window.React;
const { useRef, useState, useEffect, useMemo } = React;
const {
  motion, useInView,
  ArrowUpRight, Check, ChevronRight, Zap, BookOpen, Shield,
  PageHero, PageSection, SectionLockup, Pill, CrossLinks, FooterBar,
  MONO, SERIF, MODULES, GUIDE_BY_MODULE, eur,
} = window;

const DASHBOARD_URL = 'https://app.atreoxai.com';
const GREEN = window.ACCENT;
const GREEN_RGB = window.ACCENT_RGB;

/* ─── The index: all eight, priced, clickable. Lets someone who came
   here for one module get to it without scrolling past seven. ─── */
function ModuleIndex({ jump }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.05 });
  return (
    <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12 }}>
      {MODULES.map((m, i) => {
        const Icon = m.icon;
        return (
          <motion.button key={m.key} type="button" onClick={() => jump(m.key)}
            initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: i * 0.045 }}
            className="panel panel-hover"
            style={{
              padding: '16px 18px', textAlign: 'left', width: '100%',
              display: 'flex', alignItems: 'center', gap: 13, background: 'transparent',
            }}>
            <span aria-hidden="true" style={{
              width: 32, height: 32, borderRadius: 4, flexShrink: 0,
              background: `rgba(${GREEN_RGB},0.08)`, border: `1px solid rgba(${GREEN_RGB},0.22)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={15} color={GREEN} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontFamily: MONO, fontWeight: 500, fontSize: '0.68rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: 'white', lineHeight: 1.3 }}>
                {m.name}
              </span>
              <span style={{ display: 'block', marginTop: 4, fontFamily: MONO, fontWeight: 400, fontSize: '0.6rem', letterSpacing: '0.08em', color: m.included ? 'rgba(255,255,255,0.34)' : `rgba(${GREEN_RGB},0.7)` }}>
                {m.included ? 'included' : `${eur(m.price)} / mo`}
              </span>
            </span>
            <ChevronRight size={14} color={`rgba(${GREEN_RGB},0.45)`} />
          </motion.button>
        );
      })}
    </div>
  );
}

/* ─── Numbered practice step ─── */
function PracticeStep({ n, title, body, last }) {
  return (
    <div style={{ display: 'flex', gap: 16, paddingBottom: last ? 0 : 20 }}>
      {/* index + connecting rail — the sequence has to read as a sequence */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <span style={{
          width: 26, height: 26, borderRadius: 3, flexShrink: 0,
          border: `1px solid rgba(${GREEN_RGB},0.32)`, background: `rgba(${GREEN_RGB},0.06)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: MONO, fontWeight: 600, fontSize: '0.6rem', color: GREEN, lineHeight: 1,
        }}>{String(n).padStart(2, '0')}</span>
        {!last && <span aria-hidden="true" style={{ flex: 1, width: 1, marginTop: 6, background: `linear-gradient(180deg, rgba(${GREEN_RGB},0.28), rgba(${GREEN_RGB},0.05))` }} />}
      </div>
      <div style={{ minWidth: 0, paddingTop: 3 }}>
        <h4 style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.68rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'white', marginBottom: 7 }}>{title}</h4>
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.66)', lineHeight: 1.7 }}>{body}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   In-card demos.

   Only two modules get one, and only because a paragraph genuinely
   loses to a picture there: "reactions arrive on a human curve" and
   "this filter rejects most of what you find" are both claims you
   either see or take on faith.

   Everything here is SIMULATED and says so in the card. Nothing on
   this page is allowed to look like a live feed from someone's
   account — an invented number that reads as real is a lie whether or
   not it's labelled in the source.
══════════════════════════════════════════════════════════════════ */

/* Deterministic RNG so a demo looks the same on every render and every
   visitor's screen — a shape that reshuffles on each paint reads as a
   live feed, which is the one thing these must never do. */
function _lcg(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const DEMO_LABEL = 'Example — simulated';

function DemoFrame({ title, note, children, controls }) {
  return (
    <div className="panel" style={{ padding: '26px 28px 28px', marginTop: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
        <span className="overline">{'// '}{title}</span>
        {/* the "this isn't real data" marker, at the top where it's read
            before the picture rather than under it as a disclaimer */}
        <span style={{
          fontFamily: MONO, fontWeight: 500, fontSize: '0.54rem', letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)',
          background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 3, padding: '4px 8px', lineHeight: 1,
        }}>{DEMO_LABEL}</span>
        <span style={{ marginLeft: 'auto' }}>{controls}</span>
      </div>
      <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.86rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, marginBottom: 22, maxWidth: 640 }}>
        {note}
      </p>
      {children}
    </div>
  );
}

function DemoToggle({ options, value, onChange }) {
  return (
    <div role="group" style={{ display: 'flex', gap: 3, padding: 3, borderRadius: 4, border: `1px solid rgba(${GREEN_RGB},0.2)`, background: 'rgba(0,0,0,0.3)' }}>
      {options.map(([val, label]) => {
        const on = value === val;
        return (
          <button key={val} type="button" onClick={() => onChange(val)} aria-pressed={on}
            style={{
              padding: '7px 13px', borderRadius: 3, border: 'none', cursor: 'pointer',
              fontFamily: MONO, fontWeight: 500, fontSize: '0.58rem', letterSpacing: '0.14em',
              textTransform: 'uppercase', transition: 'background 0.18s ease, color 0.18s ease',
              background: on ? GREEN : 'transparent',
              color: on ? '#00141c' : 'rgba(255,255,255,0.5)',
            }}>{label}</button>
        );
      })}
    </div>
  );
}

/* ─── Mass Reactions: what the arrival curve actually does ───
   Mirrors the engine's own _arrival_offsets(): 'human' draws from an
   exponential with mean = window/4 and folds overshoot back inside the
   window instead of clamping it (a clamp piles every long draw onto the
   final second); 'uniform' is flat. Same maths, 24 accounts, one hour. */
function ArrivalCurveDemo() {
  const [curve, setCurve] = useState('human');
  const WINDOW_MIN = 60;
  const COUNT = 24;

  const points = useMemo(() => {
    const rnd = _lcg(20260816);
    const windowSec = WINDOW_MIN * 60;
    const mean = windowSec / 4;
    const out = [];
    for (let i = 0; i < COUNT; i++) {
      const base = 30 + rnd() * 60;            // first_delay 30–90s
      let spread;
      if (curve === 'uniform') {
        spread = rnd() * windowSec;
      } else {
        spread = -mean * Math.log(1 - rnd());  // exponential
        if (spread > windowSec) spread = windowSec - (spread % windowSec);
      }
      out.push({ t: Math.min(base + spread, windowSec) / windowSec, j: rnd() });
    }
    return out.sort((a, b) => a.t - b.t);
  }, [curve]);

  return (
    <DemoFrame
      title="Arrival curve"
      note="Twenty-four accounts reacting to one post across an hour, run through the same maths the engine uses. Human clusters early and thins out, the way a real post's reactions actually land. Uniform is the evenly-spaced metronome most tools ship."
      controls={<DemoToggle options={[['human', 'Human'], ['uniform', 'Uniform']]} value={curve} onChange={setCurve} />}
    >
      <div style={{ position: 'relative', height: 92, borderRadius: 4, background: 'rgba(0,0,0,0.28)', border: `1px solid rgba(${GREEN_RGB},0.12)`, overflow: 'hidden' }}>
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <span key={f} aria-hidden="true" style={{ position: 'absolute', left: `${f * 100}%`, top: 0, bottom: 0, width: 1, background: `rgba(${GREEN_RGB},0.09)` }} />
        ))}
        {points.map((p, i) => (
          <span key={i} aria-hidden="true" style={{
            position: 'absolute',
            left: `calc(${p.t * 100}% - 4px)`,
            top: 12 + p.j * 60,
            width: 8, height: 8, borderRadius: '50%',
            background: GREEN, boxShadow: `0 0 10px rgba(${GREEN_RGB},0.55)`,
            transition: 'left 0.55s cubic-bezier(0.16,1,0.3,1), top 0.55s cubic-bezier(0.16,1,0.3,1)',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 9 }}>
        {['post published', '15 min', '30 min', '45 min', '1 hour'].map(l => (
          <span key={l} style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>{l}</span>
        ))}
      </div>
    </DemoFrame>
  );
}

/* ─── Channel Parser: what the comments-closed filter costs ───
   The numbers are the engine's own measured run (19 real candidates,
   14 with no linked discussion group), not an illustrative invention —
   see the discovery.py docstring. */
function ParserFunnelDemo() {
  const [filterOn, setFilterOn] = useState(true);
  const TOTAL = 19;
  const NO_DISCUSSION = 14;
  const kept = filterOn ? TOTAL - NO_DISCUSSION : TOTAL;

  const rows = [
    { label: 'Found by search', n: TOTAL, tone: 'dim' },
    { label: filterOn ? 'Dropped — no discussion group' : 'Kept, but you cannot comment in them', n: NO_DISCUSSION, tone: filterOn ? 'reject' : 'warn' },
    { label: 'Left to work with', n: kept, tone: 'accent' },
  ];
  const colour = { dim: 'rgba(255,255,255,0.45)', reject: 'rgba(255,120,120,0.85)', warn: 'rgba(255,190,90,0.9)', accent: GREEN };

  return (
    <DemoFrame
      title="What the comments-closed filter costs"
      note="One real measured search: nineteen channels matched the keywords, and fourteen of them had no linked discussion group — nowhere to leave a comment at all. It is the harshest filter in the pipeline, which is exactly why it has a switch."
      controls={<DemoToggle options={[['on', 'Filter on'], ['off', 'Filter off']].map(([v, l]) => [v === 'on', l])} value={filterOn} onChange={setFilterOn} />}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {rows.map(({ label, n, tone }) => (
          <div key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
              <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>{label}</span>
              <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.8rem', color: colour[tone] }}>{n}</span>
            </div>
            <div style={{ height: 7, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${(n / TOTAL) * 100}%`, borderRadius: 4,
                background: colour[tone], opacity: tone === 'dim' ? 0.35 : 0.8,
                transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1)',
              }} />
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.83rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, marginTop: 18 }}>
        {filterOn
          ? 'On, you get a short list you can actually use. Every rejection is tallied by cause, so you can see what the filter cost you rather than guess.'
          : 'Off, the list is nearly four times longer — and most of it is channels where no comment can ever be posted. Useful for surveying a niche, not for feeding the commenting engine.'}
      </p>
    </DemoFrame>
  );
}

const DEMOS = {
  'arrival-curve': ArrivalCurveDemo,
  'parser-funnel': ParserFunnelDemo,
};

/* ─── One module, in full ─── */
function ModuleSection({ mod, index, setPage }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.04 });
  const Icon = mod.icon;
  const guide = GUIDE_BY_MODULE[mod.key];

  return (
    <div ref={ref} id={'fn-' + mod.key} style={{ scrollMarginTop: 84 }}>
      <motion.section
        initial={{ opacity: 0, y: 36 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        style={{
          maxWidth: 1280, margin: '0 auto', padding: '64px 5%',
          borderTop: index === 0 ? 'none' : `1px solid rgba(${GREEN_RGB},0.1)`,
        }}>

        {/* ── header: number · icon · name · price · guide ── */}
        <div style={{ display: 'flex', gap: 26, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 34 }}>
          <div style={{ flex: '1 1 420px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 16, flexWrap: 'wrap' }}>
              <span aria-hidden="true" style={{
                width: 44, height: 44, borderRadius: 5, flexShrink: 0,
                background: `rgba(${GREEN_RGB},0.08)`, border: `1px solid rgba(${GREEN_RGB},0.26)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 22px rgba(${GREEN_RGB},0.1)`,
              }}>
                <Icon size={20} color={GREEN} />
              </span>
              <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.64rem', letterSpacing: '0.18em', color: `rgba(${GREEN_RGB},0.4)` }}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <Pill>{mod.tagline}</Pill>
            </div>
            <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(1.9rem, 3.6vw, 2.7rem)', color: 'white', letterSpacing: '-0.015em', lineHeight: 1.1, marginBottom: 16 }}>
              {mod.name}
            </h2>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.62)', lineHeight: 1.75, maxWidth: 620 }}>
              {mod.does}
            </p>
          </div>

          {/* price + guide rail — the two exits from every section */}
          <div style={{ flex: '0 1 250px', minWidth: 220, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button type="button" onClick={() => setPage('pricing')}
              className="panel panel-hover"
              style={{ padding: '18px 20px', textAlign: 'left', background: 'transparent', width: '100%' }}>
              <span style={{ display: 'block', fontFamily: MONO, fontWeight: 500, fontSize: '0.56rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: `rgba(${GREEN_RGB},0.65)`, marginBottom: 10 }}>
                {'// '}Price
              </span>
              {mod.included ? (
                <>
                  <span style={{ display: 'block', fontFamily: SERIF, fontWeight: 500, fontSize: '1.5rem', color: 'white', lineHeight: 1.1 }}>Included</span>
                  <span style={{ display: 'block', marginTop: 7, fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                    Comes with any purchase, down to a single module.
                  </span>
                </>
              ) : (
                <>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                    <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '2rem', color: GREEN, lineHeight: 1, textShadow: `0 0 24px rgba(${GREEN_RGB},0.28)` }}>{eur(mod.price)}</span>
                    <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>/ month</span>
                  </span>
                  <span style={{ display: 'block', marginTop: 8, fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                    Runs on its own, or inside the full licence.
                  </span>
                </>
              )}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, fontFamily: MONO, fontWeight: 500, fontSize: '0.58rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: GREEN }}>
                See pricing <ArrowUpRight size={12} />
              </span>
            </button>

            {guide && (
              /* a real address — the guide is its own page, so this is a
                 link a crawler follows and a reader can copy, with the
                 click intercepted only to keep the transition in-app */
              <a href={window.guideHref(guide)}
                onClick={e => {
                  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                  e.preventDefault();
                  setPage('guides', 'guide-' + guide.slug);
                }}
                className="panel panel-hover"
                style={{ padding: '16px 20px', textAlign: 'left', background: 'transparent', width: '100%', display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                <BookOpen size={16} color={GREEN} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontFamily: MONO, fontWeight: 500, fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'white' }}>
                    Setup guide
                  </span>
                  <span style={{ display: 'block', marginTop: 4, fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)' }}>
                    {guide.video ? 'Watch the walkthrough' : 'Read it end to end'}
                  </span>
                </span>
                <ArrowUpRight size={13} color={`rgba(${GREEN_RGB},0.6)`} />
              </a>
            )}
          </div>
        </div>

        {/* ── the problem ── */}
        <div className="panel" style={{ padding: '26px 28px', marginBottom: 30, borderLeft: `2px solid rgba(${GREEN_RGB},0.4)` }}>
          <span className="overline" style={{ display: 'block', marginBottom: 12 }}>{'// '}The problem</span>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.93rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, maxWidth: 760 }}>
            {mod.problem}
          </p>
        </div>

        {/* ── practice + configuration, side by side ── */}
        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'stretch' }}>
          <div className="panel" style={{ flex: '1 1 380px', padding: '30px 30px 32px' }}>
            <span className="overline" style={{ display: 'block', marginBottom: 24 }}>{'// '}How it works in practice</span>
            {mod.steps.map(([title, body], i) => (
              <PracticeStep key={title} n={i + 1} title={title} body={body} last={i === mod.steps.length - 1} />
            ))}
          </div>

          <div className="panel ticks" style={{ flex: '1 1 380px', padding: '30px 30px 32px' }}>
            <span className="overline" style={{ display: 'block', marginBottom: 8 }}>{'// '}What you configure</span>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, marginBottom: 22 }}>
              Every one of these is a control in the panel, not a support ticket.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {mod.config.map(([label, body]) => (
                <div key={label} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                  <Check size={14} color={GREEN} style={{ marginTop: 3, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.86rem', color: 'rgba(255,255,255,0.88)', marginBottom: 3 }}>{label}</span>
                    <span style={{ display: 'block', fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.83rem', color: 'rgba(255,255,255,0.48)', lineHeight: 1.65 }}>{body}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── the demo, for the two modules that earn one ── */}
        {mod.demo && DEMOS[mod.demo] && React.createElement(DEMOS[mod.demo])}

        {/* ── the one limit worth reading before paying ──
           Only rendered for modules that carry a `guard`. This is the
           answer to "will this cost me my accounts", so it sits after
           the settings rather than competing with them. ── */}
        {mod.guard && (
          <div className="panel" style={{
            marginTop: 22, padding: '24px 26px',
            borderLeft: `2px solid rgba(${GREEN_RGB},0.4)`,
            display: 'flex', gap: 15, alignItems: 'flex-start',
          }}>
            <Shield size={17} color={GREEN} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ minWidth: 0 }}>
              <span className="overline" style={{ display: 'block', marginBottom: 10 }}>{'// '}The limit you can't turn off</span>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, maxWidth: 760 }}>
                {mod.guard}
              </p>
            </div>
          </div>
        )}
      </motion.section>
    </div>
  );
}

function FunctionsPage({ setPage }) {
  const jump = (key) => {
    const el = document.getElementById('fn-' + key);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div>
      <PageHero
        badge="Functions"
        title="Eight modules. One panel."
        sub="Every module runs on its own and they compose into one pipeline. Below: what each one does, the problem it exists for, how it behaves once it's running, and every setting it gives you."
      />

      <PageSection style={{ paddingBottom: 40 }}>
        <SectionLockup title="The modules">
          Listed in the same order you'll find them in the panel, so this page and your sidebar
          never disagree. Account Manager and Profile Templates sit under all of it and ship with
          any purchase.
        </SectionLockup>
        <ModuleIndex jump={jump} />
      </PageSection>

      {MODULES.map((m, i) => (
        <ModuleSection key={m.key} mod={m} index={i} setPage={setPage} />
      ))}

      {/* ── close ── */}
      <PageSection>
        <motion.div className="panel ticks featured-pulse" style={{ padding: 'clamp(48px, 7vw, 84px)', textAlign: 'center' }}>
          <div style={{ width: 46, height: 46, borderRadius: 5, background: `rgba(${GREEN_RGB},0.08)`, border: `1px solid rgba(${GREEN_RGB},0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
            <Zap size={20} color={GREEN} />
          </div>
          <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(1.7rem, 3.3vw, 2.4rem)', color: 'white', marginBottom: 14, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
            Take the ones you need
          </h2>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)', maxWidth: 500, margin: '0 auto 30px', lineHeight: 1.65 }}>
            Modules are billed one by one, so a campaign that only needs discovery and commenting
            only pays for discovery and commenting.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-solid" onClick={() => setPage('pricing')} style={{ padding: '15px 30px', fontSize: '0.8rem' }}>
              Build your licence <ArrowUpRight size={15} />
            </button>
            <button className="btn-outline" onClick={() => setPage('guides')} style={{ padding: '14px 26px' }}>
              See the guides <ArrowUpRight size={14} />
            </button>
          </div>
        </motion.div>
      </PageSection>

      <CrossLinks current="functions" setPage={setPage} />

      <div style={{ padding: '0 5% 64px' }}><FooterBar setPage={setPage} /></div>
    </div>
  );
}

Object.assign(window, { FunctionsPage });
