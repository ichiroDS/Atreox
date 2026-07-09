
const React = window.React;
const { useRef, useState, useEffect } = React;
const {
  motion, useInView,
  ArrowUpRight, Check, Users, Globe, Brain, Zap,
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

// Per-card button (label + destination) for the visitor's current plan state.
function pricingCTA(tierKey, sub) {
  const getStarted = { label: 'Get Started', href: `${DASHBOARD_URL}/billing?plan=${tierKey}` };
  if (sub.loading || !sub.active) return getStarted;

  if (sub.tier === tierKey) return { label: 'Enter panel', href: DASHBOARD_URL };
  if (sub.tier === 'starter' && tierKey === 'full') {
    return { label: 'Upgrade', href: `${DASHBOARD_URL}/billing?plan=full` };
  }
  if (sub.tier === 'full' && tierKey === 'starter') {
    return { label: 'Downgrade', href: `${DASHBOARD_URL}/billing` };
  }
  return getStarted;
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
   PRICING PAGE (subscription tiers)
══════════════════════════════════════ */
function PricingCard({ tier, index, inView, sub }) {
  const cta = pricingCTA(tier.key, sub);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: index * 0.1 }}
      className={'panel panel-hover' + (tier.featured ? ' ticks featured-pulse' : '')}
      style={{
        padding: '40px 36px', flex: '1 1 320px', position: 'relative',
        borderColor: tier.featured ? `rgba(${GREEN_RGB},0.45)` : undefined,
      }}>
      {tier.featured && (
        <div style={{ position: 'absolute', top: 24, right: 24, background: GREEN, borderRadius: 3, padding: '5px 12px' }}>
          <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: '0.58rem', color: '#00141c', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Most Popular</span>
        </div>
      )}

      <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.64rem', color: `rgba(${GREEN_RGB},0.7)`, letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 14, display: 'block' }}>{'// '}{tier.name}</span>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
        <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '3rem', color: GREEN, lineHeight: 1, textShadow: `0 0 28px rgba(${GREEN_RGB},0.3)` }}>€{tier.price}</span>
        <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>/ month</span>
      </div>
      <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 26 }}>{tier.blurb}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 32, borderTop: `1px solid rgba(${GREEN_RGB},0.1)`, paddingTop: 24 }}>
        {tier.features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <Check size={14} color={GREEN} style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.86rem', color: 'rgba(255,255,255,0.68)', lineHeight: 1.5 }}>{f}</span>
          </div>
        ))}
      </div>

      <a href={cta.href} target="_self" className={tier.featured ? 'btn-solid' : 'btn-outline'}
        style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '0.8rem' }}>
        {cta.label} <ArrowUpRight size={15} />
      </a>
    </motion.div>
  );
}

function PricingPage({ setPage }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const sub = useSubscriptionState();

  const tiers = [
    {
      key: 'starter', name: 'Starter', price: 29, featured: false,
      blurb: 'For a single project testing the water on a handful of channels.',
      features: [
        'Up to 50 Telegram accounts',
        'Standard channel discovery with keyword filters',
        '1 persona preset',
        'Anti-ban warmup & health checks',
        'Email support',
      ],
    },
    {
      key: 'full', name: 'Full', price: 69, featured: true,
      blurb: 'For teams running multiple campaigns and scaling reach fast.',
      features: [
        'Unlimited Telegram accounts',
        'Advanced discovery with engagement scoring',
        'Unlimited persona presets + custom tone training',
        'Anti-ban warmup automation & proxy rotation',
        'Priority support + onboarding call',
      ],
    },
  ];

  return (
    <div>
      <PageHero
        badge="Pricing"
        title="Simple, transparent pricing."
        sub="Two plans. No one-time purchases, no license tiers — just a monthly subscription that scales with how many accounts and channels you run."
      />

      <PageSection>
        <div ref={ref} style={{ display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'stretch', justifyContent: 'center', maxWidth: 900, margin: '0 auto' }}>
          {tiers.map((tier, i) => (
            <PricingCard key={tier.name} tier={tier} index={i} inView={inView} sub={sub} />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 44 }}>
          <p style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.7rem', letterSpacing: '0.04em', color: 'rgba(255,255,255,0.38)' }}>
            Need more accounts or a custom setup? <a href="mailto:hello@atreoxai.com" style={{ color: GREEN, textDecoration: 'none' }}>Get in touch</a>.
          </p>
        </div>
      </PageSection>

      <div style={{ padding: '0 5% 64px' }}><FooterBar setPage={setPage} /></div>
    </div>
  );
}

Object.assign(window, { FunctionsPage, PricingPage });
