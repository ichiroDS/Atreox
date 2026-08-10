
const React = window.React;
const { useRef, useState, useEffect } = React;
const {
  motion, useInView,
  ArrowUpRight, Check, Users, Globe, Brain, Zap, MessageSquare, Sparkles,
  SectionBadge, BlurText, FooterBar,
} = window;

const DASHBOARD_URL = 'https://app.atreoxai.com';
const MONO  = "'JetBrains Mono', monospace";
const SERIF = "'Playfair Display', Georgia, serif";
const GREEN = window.ACCENT;
const GREEN_RGB = window.ACCENT_RGB;

// Mirrors atreox-dashboard's isActiveStatus() (lib/stripe/subscription-store.ts)
// so "active" means the same thing on both sides of the deep link.
const CLERK_ACTIVE_STATUSES = new Set(['active', 'trialing']);

// The Clerk script tag in index.html is `defer`, and this file is itself a
// Babel-transpiled <script type="text/babel"> — neither load order relative
// to the other is guaranteed, so poll for window.Clerk rather than assume
// it's already there.
function waitForClerk(timeoutMs = 8000) {
  return new Promise((resolve) => {
    if (window.Clerk) return resolve(window.Clerk);
    const start = Date.now();
    const iv = setInterval(() => {
      if (window.Clerk) { clearInterval(iv); resolve(window.Clerk); }
      else if (Date.now() - start > timeoutMs) { clearInterval(iv); resolve(null); }
    }, 50);
  });
}

// Resolves to the visitor's real plan state once Clerk hydrates. `loading`
// stays true (buttons render their signed-out default) until then, so there's
// one transition at most instead of a flash between guesses.
function useSubscriptionState() {
  const [state, setState] = useState({ loading: true, tier: null, active: false });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const clerk = await waitForClerk();
        if (!clerk) { if (!cancelled) setState({ loading: false, tier: null, active: false }); return; }
        await clerk.load();
        if (cancelled) return;
        const meta = clerk.user?.publicMetadata || {};
        setState({
          loading: false,
          tier: meta.subscriptionTier ?? null,
          active: CLERK_ACTIVE_STATUSES.has(meta.subscriptionStatus),
        });
      } catch (_) {
        if (!cancelled) setState({ loading: false, tier: null, active: false });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return state;
}

// Checkout for the modular plans isn't wired yet — every CTA lands on the
// dashboard's billing screen and the chosen plan gets passed in a later pass.
// Until then the only thing the Clerk state changes is the wording: an existing
// subscriber is managing a licence, not buying one.
const BILLING_URL = `${DASHBOARD_URL}/billing`;

function billingCTA(sub, label) {
  if (!sub.loading && sub.active) return { label: 'Manage in panel', href: BILLING_URL };
  return { label, href: BILLING_URL };
}

/* ─── shared inner-page hero (Functions / Pricing) ─── */
function PageHero({ badge, title, sub }) {
  return (
    <section style={{ paddingTop: 170, paddingBottom: 84, paddingLeft: '5%', paddingRight: '5%', textAlign: 'center', borderBottom: `1px solid rgba(${GREEN_RGB},0.12)` }}>
      <SectionBadge>{badge}</SectionBadge>
      <BlurText text={title} style={{
        fontFamily: SERIF, fontWeight: 500,
        fontSize: 'clamp(2.5rem, 4.6vw, 4rem)', color: 'white',
        lineHeight: 1.08, letterSpacing: '-0.015em', marginTop: 22, marginBottom: 20
      }} delay={90} />
      <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.5)', maxWidth: 560, margin: '0 auto', lineHeight: 1.65 }}>
        {sub}
      </p>
    </section>
  );
}

/* ─── section wrapper ─── */
function PageSection({ children, style }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  return (
    <div ref={ref}>
      <motion.div
        className="section-block"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.65 }}
        style={{ padding: '88px 5%', maxWidth: 1280, margin: '0 auto', ...style }}>
        {children}
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════
   FUNCTIONS PAGE
══════════════════════════════════════ */
function FunctionCard({ icon: Icon, title, tagline, body, bullets, index, inView }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: index * 0.1 }}
      className="panel panel-hover ticks" style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ width: 52, height: 52, borderRadius: 5, background: `rgba(${GREEN_RGB},0.08)`, border: `1px solid rgba(${GREEN_RGB},0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={24} color={GREEN} />
        </div>
        <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.66rem', letterSpacing: '0.16em', color: `rgba(${GREEN_RGB},0.4)` }}>{String(index + 1).padStart(2, '0')}</span>
      </div>
      <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.62rem', color: GREEN, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10, display: 'block' }}>{'// '}{tagline}</span>
      <h3 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '1.45rem', color: 'white', marginBottom: 14, letterSpacing: '-0.01em', lineHeight: 1.2 }}>{title}</h3>
      <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.88rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, marginBottom: 24 }}>{body}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto', borderTop: `1px solid rgba(${GREEN_RGB},0.1)`, paddingTop: 20 }}>
        {bullets.map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <Check size={14} color={GREEN} style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.83rem', color: 'rgba(255,255,255,0.68)', lineHeight: 1.5 }}>{b}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function FunctionsPage({ setPage }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  const functions = [
    {
      icon: Users, tagline: 'Account Manager', title: 'Every account, under control',
      body: "Import, monitor, and rotate the Telegram accounts that power your campaigns — all from one screen.",
      bullets: [
        'Bulk import via CSV or API — bring your own accounts or provisioned ones',
        'Automated health checks & risk scoring catch problems before they cause bans',
        'Built-in proxy management & rotation keeps every account isolated and clean',
      ],
    },
    {
      icon: Globe, tagline: 'Channel Parser', title: 'Discovery that finds the right rooms',
      body: 'Automatically discover the crypto and tech channels worth commenting in — filtered and ranked so you\'re never guessing.',
      bullets: [
        'Keyword, niche, and language filters tuned for crypto & tech',
        'Subscriber count and engagement-rate thresholds cut out dead channels',
        'Auto-refreshing watchlists keep discovery running in the background',
      ],
    },
    {
      icon: Brain, tagline: 'Neurocommenting', title: 'The engine that actually posts',
      body: 'Comments are generated and assigned in real time, matching tone and context per channel, with full visibility into what the engine is doing.',
      bullets: [
        'Persona presets and custom tone training per account or campaign',
        'Auto-assignment matches accounts to channels based on fit and load',
        'Live engine control panel with real-time logs — pause, resume, or intervene anytime',
      ],
    },
  ];

  return (
    <div>
      <PageHero
        badge="Functions"
        title="How ATREOX runs."
        sub="Three systems working together: accounts that stay safe, discovery that finds the right channels, and an engine that comments like a real person."
      />

      <PageSection>
        <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 22 }}>
          {functions.map((f, i) => (
            <FunctionCard key={f.tagline} {...f} index={i} inView={inView} />
          ))}
        </div>
      </PageSection>

      <PageSection style={{ paddingTop: 0 }}>
        <motion.div className="panel ticks" style={{ padding: 'clamp(48px, 7vw, 84px)', textAlign: 'center' }}>
          <div style={{ width: 46, height: 46, borderRadius: 5, background: `rgba(${GREEN_RGB},0.08)`, border: `1px solid rgba(${GREEN_RGB},0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
            <Zap size={20} color={GREEN} />
          </div>
          <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(1.7rem, 3.3vw, 2.4rem)', color: 'white', marginBottom: 14, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
            See it running on your channels
          </h2>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)', maxWidth: 480, margin: '0 auto 30px', lineHeight: 1.65 }}>
            Every function above lives inside the dashboard. Pick a plan or jump straight in.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-solid" onClick={() => setPage('pricing')} style={{ padding: '15px 30px', fontSize: '0.8rem' }}>
              See Pricing <ArrowUpRight size={15} />
            </button>
            <a href={DASHBOARD_URL} target="_self" className="btn-outline" style={{ padding: '14px 26px' }}>
              Enter Panel <ArrowUpRight size={14} />
            </a>
          </div>
        </motion.div>
      </PageSection>

      <div style={{ padding: '0 5% 64px' }}><FooterBar setPage={setPage} /></div>
    </div>
  );
}

/* ══════════════════════════════════════
   PRICING PAGE (modular licence)
══════════════════════════════════════ */

// Monthly list price per module, heaviest first — the price column then reads
// as a descending ladder, which is what the "why prices differ" note points at.
const MODULES = [
  { key: 'neurocommenting', name: 'Neurocommenting', price: 50, icon: MessageSquare,
    desc: 'Watches the channels you choose and writes a comment under every new post.' },
  { key: 'neurodialogs', name: 'NeuroDialogs', price: 45, icon: Brain,
    desc: 'Answers direct messages and chat replies in context, from your own accounts.' },
  { key: 'active-warmup', name: 'Active Warmup', price: 30, icon: Zap,
    desc: 'Runs scheduled activity on your accounts so a new one behaves like a used one.' },
  { key: 'mass-reactions', name: 'Mass Reactions', price: 30, icon: Sparkles,
    desc: 'Puts reactions on a post from many accounts at once.' },
  { key: 'channel-parser', name: 'Channel Parser', price: 20, icon: Globe,
    desc: 'Finds channels by keyword and exports them as a target list.' },
  { key: 'group-parser', name: 'Group Parser', price: 20, icon: Users,
    desc: 'Finds active public groups by keyword and exports them.' },
];

const MODULE_BY_KEY = Object.fromEntries(MODULES.map(m => [m.key, m]));

const FULL_MONTHLY  = 120;
const FULL_YEARLY   = 1000;
const YEARLY_SAVING = FULL_MONTHLY * 12 - FULL_YEARLY;

const eur = n => '€' + n.toLocaleString('en-US');

/* ─── Section lockup: the dashboard's one-name-per-section header —
   cyan // glyph, serif title, hairline rule out to the edge. ─── */
function SectionLockup({ title, children }) {
  return (
    <div style={{ marginBottom: 34 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <span aria-hidden="true" style={{ fontFamily: MONO, fontWeight: 600, fontSize: '1rem', lineHeight: 1, color: GREEN, userSelect: 'none' }}>//</span>
        <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', color: 'white', letterSpacing: '-0.01em', lineHeight: 1 }}>
          {title}
        </h2>
        <div aria-hidden="true" className="section-rule" style={{ flex: '1 1 32px', minWidth: 32 }} />
      </div>
      {children && (
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: 620, marginTop: 14 }}>
          {children}
        </p>
      )}
    </div>
  );
}

/* ─── Sharp-cornered marker pill, same lockup language as the v1.0 chip ─── */
function Pill({ children, dot }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
      border: `1px solid rgba(${GREEN_RGB},0.35)`, background: `rgba(${GREEN_RGB},0.08)`,
      borderRadius: 3, padding: '4px 9px', boxShadow: `0 0 10px rgba(${GREEN_RGB},0.12)`,
      fontFamily: MONO, fontWeight: 600, fontSize: '0.58rem', lineHeight: 1,
      letterSpacing: '0.16em', textTransform: 'uppercase', color: GREEN,
    }}>
      {dot && <span aria-hidden="true" style={{ width: 4, height: 4, background: GREEN, boxShadow: `0 0 6px rgba(${GREEN_RGB},0.8)` }} />}
      {children}
    </span>
  );
}

/* ─── one selectable module ─── */
function ModuleCard({ mod, selected, onToggle }) {
  const Icon = mod.icon;
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={'panel panel-hover' + (selected ? ' ticks' : '')}
      style={{
        padding: '26px 26px 28px', textAlign: 'left', width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', gap: 18,
        borderColor: selected ? `rgba(${GREEN_RGB},0.45)` : undefined,
        // backgroundColor, not the shorthand — the shorthand would drop .panel's gradient layer
        backgroundColor: selected ? `rgba(${GREEN_RGB},0.05)` : undefined,
        transition: 'border-color 0.16s ease, background-color 0.16s ease, box-shadow 0.18s ease, transform 0.18s cubic-bezier(0.2,0.9,0.3,1)',
      }}>
      {/* icon · name · checkbox — the dashboard's module-tile anatomy */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <span aria-hidden="true" style={{
          width: 34, height: 34, borderRadius: 4, flexShrink: 0,
          background: `rgba(${GREEN_RGB},0.08)`, border: `1px solid rgba(${GREEN_RGB},${selected ? 0.4 : 0.22})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color 0.16s ease',
        }}>
          <Icon size={16} color={GREEN} />
        </span>
        <span style={{
          flex: 1, minWidth: 0, fontFamily: MONO, fontWeight: 500, fontSize: '0.72rem',
          letterSpacing: '0.14em', textTransform: 'uppercase', color: 'white', lineHeight: 1.3,
        }}>
          {mod.name}
        </span>
        <span aria-hidden="true" style={{
          width: 20, height: 20, borderRadius: 3, flexShrink: 0,
          border: `1px solid rgba(${GREEN_RGB},${selected ? 1 : 0.3})`,
          background: selected ? GREEN : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background-color 0.16s ease, border-color 0.16s ease',
        }}>
          {selected && <Check size={13} color="#00141c" style={{ strokeWidth: 3 }} />}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
        <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '2.1rem', color: GREEN, lineHeight: 1 }}>{eur(mod.price)}</span>
        <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>/ month</span>
      </div>

      <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.87rem', color: 'rgba(255,255,255,0.52)', lineHeight: 1.7, marginTop: 'auto' }}>
        {mod.desc}
      </p>
    </button>
  );
}

/* ─── monthly / annual segmented control, scoped to the licence card ─── */
function TermToggle({ term, setTerm }) {
  const opt = (value, label) => {
    const on = term === value;
    return (
      <button
        key={value} type="button" role="radio" aria-checked={on}
        onClick={() => setTerm(value)}
        style={{
          flex: 1, padding: '9px 10px', border: 'none', borderRadius: 2,
          background: on ? GREEN : 'transparent',
          color: on ? '#00141c' : 'rgba(255,255,255,0.55)',
          fontFamily: MONO, fontWeight: on ? 600 : 500, fontSize: '0.6rem',
          letterSpacing: '0.16em', textTransform: 'uppercase',
          transition: 'background-color 0.16s ease, color 0.16s ease',
        }}>
        {label}
      </button>
    );
  };
  return (
    <div role="radiogroup" aria-label="Billing term" style={{
      display: 'flex', gap: 3, padding: 3, borderRadius: 4,
      border: `1px solid rgba(${GREEN_RGB},0.2)`, background: 'rgba(0,0,0,0.3)',
    }}>
      {opt('monthly', 'Monthly')}
      {opt('annual', 'Annual')}
    </div>
  );
}

/* ─── the licence, priced against the running total directly above it ─── */
function LicenceCard({ term, setTerm, sub }) {
  const annual = term === 'annual';
  const cta = billingCTA(sub, 'Get the full licence');
  return (
    <div className="panel ticks featured-pulse" style={{ padding: '24px 26px', borderColor: `rgba(${GREEN_RGB},0.45)` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
        <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.64rem', color: `rgba(${GREEN_RGB},0.75)`, letterSpacing: '0.24em', textTransform: 'uppercase' }}>{'// '}Full licence</span>
        <Pill dot>All six</Pill>
      </div>

      <TermToggle term={term} setTerm={setTerm} />

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 18 }}>
        <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '2.9rem', color: GREEN, lineHeight: 1, textShadow: `0 0 30px rgba(${GREEN_RGB},0.32)` }}>
          {eur(annual ? FULL_YEARLY : FULL_MONTHLY)}
        </span>
        <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
          / {annual ? 'year' : 'month'}
        </span>
      </div>

      {/* the saving is a number in both states — it's the reason to switch */}
      <p style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.68rem', letterSpacing: '0.06em', color: `rgba(${GREEN_RGB},0.8)`, marginTop: 10, lineHeight: 1.5 }}>
        {annual
          ? `${eur(YEARLY_SAVING)} less than 12 × ${eur(FULL_MONTHLY)}`
          : `Pay yearly: ${eur(FULL_YEARLY)} — saves ${eur(YEARLY_SAVING)}`}
      </p>

      {/* two lines, not three — "Account Manager included" is already said in
          the hero and again below; repeating it here is what makes a card read
          as filled rather than composed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 18, borderTop: `1px solid rgba(${GREEN_RGB},0.12)`, paddingTop: 16 }}>
        {[
          'All six modules, including both parsers',
          'Any module released while your licence is active, at no extra cost',
        ].map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <Check size={14} color={GREEN} style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.68)', lineHeight: 1.5 }}>{f}</span>
          </div>
        ))}
      </div>

      <a href={cta.href} target="_self" className="btn-solid"
        style={{ width: '100%', justifyContent: 'center', padding: '15px', fontSize: '0.78rem', marginTop: 20 }}>
        {cta.label} <ArrowUpRight size={15} />
      </a>
    </div>
  );
}

/* ─── running total, stacked straight above the licence price ─── */
function SelectionPanel({ keys, total, onClear, sub }) {
  const n = keys.length;
  const gap = FULL_MONTHLY - total;
  const cta = billingCTA(sub, `Continue · ${eur(total)}/mo`);

  return (
    <div className="panel" style={{ padding: '22px 26px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.64rem', color: `rgba(${GREEN_RGB},0.75)`, letterSpacing: '0.24em', textTransform: 'uppercase' }}>{'// '}Your selection</span>
        {n > 0 && (
          <button type="button" onClick={onClear} style={{
            background: 'none', border: 'none', padding: 0,
            fontFamily: MONO, fontWeight: 400, fontSize: '0.6rem', letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
          }}>Clear</button>
        )}
      </div>

      {/* count rides the total's baseline rather than taking a line of its own —
          the rail has to stay short enough to sit beside the licence on one screen */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '2.9rem', color: total ? GREEN : 'rgba(255,255,255,0.28)', lineHeight: 1, textShadow: total ? `0 0 28px rgba(${GREEN_RGB},0.28)` : 'none', transition: 'color 0.2s ease' }}>
          {eur(total)}
        </span>
        <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>/ month</span>
        <span style={{ marginLeft: 'auto', fontFamily: MONO, fontWeight: 400, fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
          {n === 0 ? 'none selected' : `${n} of ${MODULES.length}`}
        </span>
      </div>

      {/* the comparison, said out loud the moment it starts to matter */}
      {total > 0 && gap > 0 && gap <= 40 && (
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.84rem', color: `rgba(${GREEN_RGB},0.85)`, lineHeight: 1.55, marginTop: 12 }}>
          {eur(gap)} more buys all six, below.
        </p>
      )}
      {total > 0 && gap <= 0 && (
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.84rem', color: `rgba(${GREEN_RGB},0.85)`, lineHeight: 1.55, marginTop: 12 }}>
          The full licence costs less than this — and includes every module.
        </p>
      )}

      {total === 0 ? (
        <button type="button" disabled className="btn-outline"
          style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '0.76rem', marginTop: 16, opacity: 0.4, cursor: 'not-allowed' }}>
          Select modules
        </button>
      ) : (
        <a href={cta.href} target="_self" className="btn-outline"
          style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '0.76rem', marginTop: 16 }}>
          {cta.label} <ArrowUpRight size={14} />
        </a>
      )}
    </div>
  );
}

function PricingPage({ setPage }) {
  const gridRef = useRef(null);
  const gridIn = useInView(gridRef, { once: true, amount: 0.05 });
  const sub = useSubscriptionState();

  const [picked, setPicked] = useState([]);
  const [term, setTerm] = useState('monthly');
  const toggle = (key) => setPicked(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key]);
  const total = picked.reduce((sum, k) => sum + MODULE_BY_KEY[k].price, 0);

  return (
    <div>
      <PageHero
        badge="Pricing"
        title="Pay for what you run."
        sub="ATREOX is modular. Take the modules you need, or take the whole licence — Account Manager and Profile Templates come with either."
      />

      {/* One block: the modules on the left, what they add up to and what
          everything costs on the right. The two prices sit in the same rail so
          the comparison never needs a scroll. */}
      <PageSection>
        <SectionLockup title="Build your licence">
          Every module runs on its own and bills monthly. Select what you need — the total updates as you go,
          and the full licence sits beside it for comparison.
        </SectionLockup>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div ref={gridRef} style={{
            flex: '1 1 520px', display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 16, alignContent: 'start',
          }}>
            {MODULES.map((m, i) => (
              <motion.div key={m.key}
                initial={{ opacity: 0, y: 8 }} animate={gridIn ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: i * 0.06 }}
                style={{ display: 'flex' }}>
                <ModuleCard mod={m} selected={picked.includes(m.key)} onToggle={() => toggle(m.key)} />
              </motion.div>
            ))}
          </div>

          {/* Sticky as a direct flex child: its containing block is then the row,
              which is as tall as the module grid, so the rail has room to travel. */}
          <div style={{
            flex: '1 1 330px', maxWidth: 400, alignSelf: 'flex-start',
            position: 'sticky', top: 80,
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <SelectionPanel keys={picked} total={total} onClear={() => setPicked([])} sub={sub} />

            <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ flex: 1, height: 1, background: `rgba(${GREEN_RGB},0.14)` }} />
              <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.58rem', letterSpacing: '0.24em', color: 'rgba(255,255,255,0.3)' }}>OR</span>
              <span style={{ flex: 1, height: 1, background: `rgba(${GREEN_RGB},0.14)` }} />
            </div>

            <LicenceCard term={term} setTerm={setTerm} sub={sub} />
          </div>
        </div>
      </PageSection>

      {/* ── the two things people ask about the price list ── */}
      <PageSection style={{ paddingTop: 0 }}>
        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'stretch' }}>
          <div className="panel" style={{ flex: '1 1 380px', padding: '34px 32px' }}>
            <span className="overline" style={{ display: 'block', marginBottom: 16 }}>{'// '}Why prices differ</span>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.75 }}>
              A module's price tracks how much computing it needs. Neurocommenting polls hundreds of channels
              continuously and generates a comment for every post that appears; NeuroDialogs holds a live
              connection open for each account and writes full replies. Active Warmup works to a schedule,
              Mass Reactions runs in short bursts, and the parsers do heavy but brief searches — which is why
              they sit at the bottom of the list.
            </p>
          </div>

          <div className="panel" style={{ flex: '1 1 380px', padding: '34px 32px' }}>
            <span className="overline" style={{ display: 'block', marginBottom: 16 }}>{'// '}Included with everything</span>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.75 }}>
              Account Manager and Profile Templates come with any purchase, down to a single module. They're how
              you upload accounts and manage profiles, so they're never sold on their own.
            </p>
            <div style={{ borderTop: `1px solid rgba(${GREEN_RGB},0.12)`, marginTop: 22, paddingTop: 20 }}>
              <span className="overline" style={{ display: 'block', marginBottom: 12 }}>{'// '}Annual billing</span>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.75 }}>
                Only the full licence is sold by the year, at {eur(FULL_YEARLY)}. Individual modules are monthly.
              </p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 44 }}>
          <p style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.7rem', letterSpacing: '0.04em', color: 'rgba(255,255,255,0.38)' }}>
            Running something bigger, or need a module that isn't here? <a href="mailto:hello@atreoxai.com" style={{ color: GREEN, textDecoration: 'none' }}>Get in touch</a>.
          </p>
        </div>
      </PageSection>

      <div style={{ padding: '0 5% 64px' }}><FooterBar setPage={setPage} /></div>
    </div>
  );
}

Object.assign(window, { FunctionsPage, PricingPage });
