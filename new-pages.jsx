
const React = window.React;
const { useRef, useState, useEffect } = React;
const {
  motion, useInView,
  ArrowUpRight, Check, Users, Globe, Brain, Zap, Layers, MessageSquare,
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
  { key: 'neurocommenting', name: 'Neurocommenting', price: 50,
    desc: 'Watches the channels you choose and writes a comment under every new post.' },
  { key: 'neurodialogs', name: 'NeuroDialogs', price: 45,
    desc: 'Answers direct messages and chat replies in context, from your own accounts.' },
  { key: 'active-warmup', name: 'Active Warmup', price: 30,
    desc: 'Runs scheduled activity on your accounts so a new one behaves like a used one.' },
  { key: 'mass-reactions', name: 'Mass Reactions', price: 30,
    desc: 'Puts reactions on a post from many accounts at once.' },
  { key: 'channel-parser', name: 'Channel Parser', price: 20,
    desc: 'Finds channels by keyword and exports them as a target list.' },
  { key: 'group-parser', name: 'Group Parser', price: 20,
    desc: 'Finds active public groups by keyword and exports them.' },
];

const MODULE_BY_KEY = Object.fromEntries(MODULES.map(m => [m.key, m]));

const KIT_KEYS      = ['neurocommenting', 'channel-parser', 'active-warmup'];
const KIT_PRICE     = 100;
const FULL_MONTHLY  = 120;
const FULL_YEARLY   = 1000;
const YEARLY_SAVING = FULL_MONTHLY * 12 - FULL_YEARLY;

const priceRow = { fontFamily: MONO, fontWeight: 400, fontSize: '0.72rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.45)' };

/* ─── one selectable module ─── */
function ModuleCard({ mod, selected, onToggle }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={'panel panel-hover' + (selected ? ' ticks' : '')}
      style={{
        padding: '20px 20px 22px', textAlign: 'left', width: '100%',
        display: 'flex', flexDirection: 'column', gap: 10,
        borderColor: selected ? `rgba(${GREEN_RGB},0.45)` : undefined,
        // backgroundColor, not the shorthand — the shorthand would drop .panel's gradient layer
        backgroundColor: selected ? `rgba(${GREEN_RGB},0.05)` : undefined,
        transition: 'border-color 0.16s ease, background-color 0.16s ease, box-shadow 0.18s ease, transform 0.18s cubic-bezier(0.2,0.9,0.3,1)',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* checkbox — the only state indicator that survives a phone screen */}
        <span aria-hidden="true" style={{
          width: 18, height: 18, borderRadius: 3, flexShrink: 0,
          border: `1px solid rgba(${GREEN_RGB},${selected ? 1 : 0.3})`,
          background: selected ? GREEN : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.16s ease, border-color 0.16s ease',
        }}>
          {selected && <Check size={12} color="#00141c" style={{ strokeWidth: 3 }} />}
        </span>
        <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.95rem', color: 'white', flex: 1, lineHeight: 1.2 }}>
          {mod.name}
        </span>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexShrink: 0 }}>
          <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '1.4rem', color: GREEN, lineHeight: 1 }}>€{mod.price}</span>
          <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>/mo</span>
        </span>
      </div>
      <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.84rem', color: 'rgba(255,255,255,0.52)', lineHeight: 1.6, paddingLeft: 30 }}>
        {mod.desc}
      </p>
    </button>
  );
}

/* ─── running total ───
   Sticky as a direct flex child: its containing block is then the row, which is
   as tall as the module grid, so the panel has room to travel. Wrapping it in
   a shrink-to-fit box instead would leave it nothing to stick against. */
function SelectionSummary({ keys, total, sub }) {
  const chosen = MODULES.filter(m => keys.includes(m.key));
  const gap = FULL_MONTHLY - total;
  const cta = billingCTA(sub, `Continue · €${total}/mo`);

  return (
    <div className="panel ticks" style={{
      flex: '1 1 300px', maxWidth: 340, alignSelf: 'flex-start',
      position: 'sticky', top: 88, padding: '26px 24px',
    }}>
      <span className="overline" style={{ display: 'block', marginBottom: 18 }}>{'// '}Your selection</span>

      {chosen.length === 0 ? (
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.86rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>
          Nothing picked yet. Choose the modules you'll actually run — the total updates as you go.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {chosen.map(m => (
            <div key={m.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.87rem', color: 'rgba(255,255,255,0.72)' }}>{m.name}</span>
              <span style={{ ...priceRow, color: 'rgba(255,255,255,0.55)', flexShrink: 0 }}>€{m.price}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ borderTop: `1px solid rgba(${GREEN_RGB},0.14)`, marginTop: 22, paddingTop: 18, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.64rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>Total</span>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '2.3rem', color: GREEN, lineHeight: 1, textShadow: total ? `0 0 28px rgba(${GREEN_RGB},0.3)` : 'none' }}>€{total}</span>
          <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.64rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>/ month</span>
        </span>
      </div>

      {/* The comparison is the point of the page, so the total says it out loud
          as soon as the selection gets close to the full licence. */}
      {total > 0 && gap > 0 && gap <= 40 && (
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.82rem', color: `rgba(${GREEN_RGB},0.85)`, lineHeight: 1.55, marginTop: 14 }}>
          €{gap} more buys all six modules on the full licence.
        </p>
      )}
      {total > 0 && gap <= 0 && (
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.82rem', color: `rgba(${GREEN_RGB},0.85)`, lineHeight: 1.55, marginTop: 14 }}>
          The full licence is €{FULL_MONTHLY} — cheaper than this selection, and it includes every module.
        </p>
      )}

      {total === 0 ? (
        <button type="button" disabled className="btn-outline"
          style={{ width: '100%', justifyContent: 'center', padding: '15px', fontSize: '0.78rem', marginTop: 22, opacity: 0.4, cursor: 'not-allowed' }}>
          Select modules
        </button>
      ) : (
        <a href={cta.href} target="_self" className="btn-solid"
          style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '0.78rem', marginTop: 22 }}>
          {cta.label} <ArrowUpRight size={14} />
        </a>
      )}

      <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.78rem', color: 'rgba(255,255,255,0.34)', lineHeight: 1.6, marginTop: 16 }}>
        Account Manager and Profile Templates are included with anything you buy. Modules bill monthly.
      </p>
    </div>
  );
}

/* ─── the two shortcut offers, side by side ─── */
function BundleCard({ bundle, index, inView, sub }) {
  const Icon = bundle.icon;
  const cta = billingCTA(sub, bundle.cta);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: index * 0.1 }}
      className={'panel panel-hover' + (bundle.featured ? ' ticks featured-pulse' : '')}
      style={{
        padding: '38px 34px', flex: '1 1 340px', display: 'flex', flexDirection: 'column',
        borderColor: bundle.featured ? `rgba(${GREEN_RGB},0.45)` : undefined,
      }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div style={{ width: 46, height: 46, borderRadius: 5, background: `rgba(${GREEN_RGB},0.08)`, border: `1px solid rgba(${GREEN_RGB},0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={GREEN} />
        </div>
        {bundle.featured && (
          <div style={{ background: GREEN, borderRadius: 3, padding: '5px 12px' }}>
            <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: '0.58rem', color: '#00141c', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Best value</span>
          </div>
        )}
      </div>

      <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.64rem', color: `rgba(${GREEN_RGB},0.7)`, letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 14, display: 'block' }}>{'// '}{bundle.label}</span>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '3rem', color: GREEN, lineHeight: 1, textShadow: `0 0 28px rgba(${GREEN_RGB},0.3)` }}>€{bundle.price}</span>
        <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>/ month</span>
      </div>
      {/* both cards carry a second price line so the two headline numbers sit
          on the same baseline — that side-by-side read is the whole argument */}
      <p style={{ ...priceRow, marginBottom: 18, color: bundle.featured ? `rgba(${GREEN_RGB},0.75)` : 'rgba(255,255,255,0.4)' }}>
        {bundle.second}
      </p>

      <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.88rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, marginBottom: 24 }}>{bundle.blurb}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 30, borderTop: `1px solid rgba(${GREEN_RGB},0.1)`, paddingTop: 22 }}>
        {bundle.features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <Check size={14} color={GREEN} style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.86rem', color: 'rgba(255,255,255,0.68)', lineHeight: 1.5 }}>{f}</span>
          </div>
        ))}
      </div>

      <a href={cta.href} target="_self" className={bundle.featured ? 'btn-solid' : 'btn-outline'}
        style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '0.8rem', marginTop: 'auto' }}>
        {cta.label} <ArrowUpRight size={15} />
      </a>
    </motion.div>
  );
}

function PricingPage({ setPage }) {
  const pickRef = useRef(null);
  const bundleRef = useRef(null);
  const pickIn = useInView(pickRef, { once: true, amount: 0.1 });
  const bundleIn = useInView(bundleRef, { once: true, amount: 0.1 });
  const sub = useSubscriptionState();

  const [picked, setPicked] = useState([]);
  const toggle = (key) => setPicked(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key]);
  const total = picked.reduce((sum, k) => sum + MODULE_BY_KEY[k].price, 0);

  const bundles = [
    {
      label: '02 — Commenting kit', icon: MessageSquare, price: KIT_PRICE, featured: false,
      second: 'monthly only', cta: 'Take the kit',
      blurb: 'The three modules a commenter actually needs — find the channels, warm the accounts, post the comments.',
      features: [
        ...KIT_KEYS.map(k => MODULE_BY_KEY[k].name),
        'Account Manager and Profile Templates included',
        `One click instead of three — the same €${KIT_PRICE} as picking them yourself`,
      ],
    },
    {
      label: '03 — Full licence', icon: Layers, price: FULL_MONTHLY, featured: true,
      second: `or €${FULL_YEARLY.toLocaleString('en-US')} / year — €${YEARLY_SAVING} less than monthly`,
      cta: 'Get the full licence',
      blurb: `Every module we sell, for €${FULL_MONTHLY - KIT_PRICE} more than the kit. Nothing to add later.`,
      features: [
        'All six modules, including both parsers',
        'Any module released while your licence is active, at no extra cost',
        'Account Manager and Profile Templates included',
        `The only plan sold annually — €${FULL_YEARLY.toLocaleString('en-US')} a year`,
      ],
    },
  ];

  return (
    <div>
      <PageHero
        badge="Pricing"
        title="Pay for what you run."
        sub="ATREOX is modular. Take a single module, take the commenting kit, or take the whole licence — Account Manager and Profile Templates come with all of them."
      />

      {/* ── 01 · the picker ── */}
      <PageSection>
        <div style={{ marginBottom: 36, maxWidth: 620 }}>
          <SectionBadge>01 — Pick modules</SectionBadge>
          <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(1.7rem, 3.2vw, 2.4rem)', color: 'white', letterSpacing: '-0.01em', lineHeight: 1.12, margin: '16px 0 12px' }}>
            Build your own.
          </h2>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
            Every module runs on its own. Select the ones you need and the total updates as you go.
          </p>
        </div>

        <div ref={pickRef} style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={pickIn ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
            style={{ flex: '1 1 540px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(258px, 1fr))', gap: 14, alignContent: 'start' }}>
            {MODULES.map(m => (
              <ModuleCard key={m.key} mod={m} selected={picked.includes(m.key)} onToggle={() => toggle(m.key)} />
            ))}
          </motion.div>

          <SelectionSummary keys={picked} total={total} sub={sub} />
        </div>
      </PageSection>

      {/* ── 02 & 03 · the two shortcuts, side by side ── */}
      <PageSection style={{ paddingTop: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: 38, maxWidth: 640, margin: '0 auto 38px' }}>
          <SectionBadge>02 & 03 — Bundles</SectionBadge>
          <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(1.7rem, 3.2vw, 2.4rem)', color: 'white', letterSpacing: '-0.01em', lineHeight: 1.12, margin: '16px 0 12px' }}>
            Or take a shortcut.
          </h2>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
            €{KIT_PRICE} gets the three modules a commenter needs. €{FULL_MONTHLY} gets all six — plus everything we release while you're subscribed.
          </p>
        </div>

        <div ref={bundleRef} style={{ display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'stretch', justifyContent: 'center', maxWidth: 900, margin: '0 auto' }}>
          {bundles.map((b, i) => (
            <BundleCard key={b.label} bundle={b} index={i} inView={bundleIn} sub={sub} />
          ))}
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
                Only the full licence is sold by the year, at €{FULL_YEARLY.toLocaleString('en-US')}. Individual
                modules and the commenting kit are monthly.
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
