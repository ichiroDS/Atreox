
const React = window.React;
const { useRef } = React;
const {
  motion, useInView,
  ArrowUpRight, Check, Users, Globe, Brain, Zap,
  SectionBadge, BlurText, FooterBar,
} = window;

const DASHBOARD_URL = 'https://app.atreoxai.com';

/* ─── shared inner-page hero (Functions / Pricing) ─── */
function PageHero({ badge, title, sub }) {
  return (
    <section data-bg-palette="blue-violet" style={{ paddingTop: 160, paddingBottom: 80, paddingLeft: '5%', paddingRight: '5%', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <SectionBadge>{badge}</SectionBadge>
      <BlurText text={title} style={{
        fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
        fontSize: 'clamp(2.8rem, 5vw, 4.5rem)', color: 'white',
        lineHeight: 0.9, letterSpacing: '-2px', marginTop: 20, marginBottom: 20
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
    <motion.div ref={ref}
      className="section-block"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65 }}
      style={{ padding: '80px 5%', maxWidth: 1280, margin: '0 auto', ...style }}>
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════
   FUNCTIONS PAGE
══════════════════════════════════════ */
function FunctionCard({ icon: Icon, title, tagline, body, bullets, index, inView }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: index * 0.1 }}
      className="liquid-glass glass-card-interactive" style={{ borderRadius: 24, padding: '36px 32px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
      <div className="feature-icon-wrap" style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
        <Icon size={24} color="#00e676" />
      </div>
      <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.68rem', color: '#00e676', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>{tagline}</span>
      <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.6rem', color: 'white', marginBottom: 14, letterSpacing: '-0.02em' }}>{title}</h3>
      <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.88rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, marginBottom: 24 }}>{body}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto' }}>
        {bullets.map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <Check size={14} color="#00e676" style={{ marginTop: 2, flexShrink: 0 }} />
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
        <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {functions.map((f, i) => (
            <FunctionCard key={f.tagline} {...f} index={i} inView={inView} />
          ))}
        </div>
      </PageSection>

      <PageSection style={{ paddingTop: 0 }}>
        <motion.div className="liquid-glass" style={{ borderRadius: 24, padding: 'clamp(32px, 5vw, 64px)', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="feature-icon-wrap" style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Zap size={20} color="#00e676" />
          </div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', color: 'white', marginBottom: 14, letterSpacing: '-0.02em' }}>
            See it running on your channels
          </h2>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)', maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.65 }}>
            Every function above lives inside the dashboard. Pick a plan or jump straight in.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-gradient" onClick={() => setPage('pricing')} style={{ borderRadius: 9999, padding: '14px 30px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              See Pricing <ArrowUpRight size={16} />
            </button>
            <a href={DASHBOARD_URL} target="_self" className="liquid-glass btn-glass-hover" style={{ borderRadius: 9999, padding: '14px 26px', border: 'none', color: 'white', textDecoration: 'none', fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'rgba(255,255,255,0.07)' }}>
              Enter Panel <ArrowUpRight size={15} />
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
function PricingCard({ tier, index, inView }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: index * 0.1 }}
      className={tier.featured ? 'liquid-glass-strong glass-card-interactive' : 'liquid-glass glass-card-interactive'}
      style={{
        borderRadius: 28, padding: '40px 36px', flex: '1 1 320px', position: 'relative',
        border: tier.featured ? '1px solid rgba(0,230,118,0.35)' : '1px solid rgba(255,255,255,0.08)',
      }}>
      {tier.featured && (
        <div style={{ position: 'absolute', top: 24, right: 24, background: 'linear-gradient(135deg, #00e676, #00bfa5)', borderRadius: 9999, padding: '4px 14px' }}>
          <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: '0.66rem', color: '#001a10', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Most Popular</span>
        </div>
      )}

      <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10, display: 'block' }}>{tier.name}</span>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
        <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '3rem', color: 'white', lineHeight: 1 }}>${tier.price}</span>
        <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)' }}>/ month</span>
      </div>
      <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 28 }}>{tier.blurb}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 32 }}>
        {tier.features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <Check size={14} color="#00e676" style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.86rem', color: 'rgba(255,255,255,0.68)', lineHeight: 1.5 }}>{f}</span>
          </div>
        ))}
      </div>

      {/*
        TODO(stripe-subscriptions): api/create-checkout-session.js currently only builds
        one-time `mode: 'payment'` Checkout Sessions for the old course/package model.
        Wiring these buttons to Stripe needs: recurring Price IDs per tier (env vars) and
        `mode: 'subscription'` in that endpoint. Left unimplemented this pass — see task
        constraints (api/ files intentionally untouched). Buttons route to the dashboard
        for now, where signup/billing can be finished.
      */}
      <a href={DASHBOARD_URL} target="_self" className={tier.featured ? 'btn-gradient' : 'liquid-glass btn-glass-hover'} style={{
        width: '100%', borderRadius: 14, padding: '15px', border: 'none', color: 'white', textDecoration: 'none',
        fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.95rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        background: tier.featured ? undefined : 'rgba(255,255,255,0.07)',
      }}>
        Get Started <ArrowUpRight size={16} />
      </a>
    </motion.div>
  );
}

function PricingPage({ setPage }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  const tiers = [
    {
      name: 'Starter', price: 99, featured: false,
      blurb: 'For a single project testing the water on a handful of channels.',
      features: [
        'Up to 5 Telegram accounts',
        '1,000 AI comments / month',
        'Standard channel discovery with keyword filters',
        '1 persona preset',
        'Anti-ban warmup & health checks',
        'Email support',
      ],
    },
    {
      name: 'Growth', price: 149, featured: true,
      blurb: 'For teams running multiple campaigns and scaling reach fast.',
      features: [
        'Up to 20 Telegram accounts',
        '5,000 AI comments / month',
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
        <div ref={ref} style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'stretch', justifyContent: 'center', maxWidth: 900, margin: '0 auto' }}>
          {tiers.map((tier, i) => (
            <PricingCard key={tier.name} tier={tier} index={i} inView={inView} />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
            Need more accounts or a custom setup? <a href="mailto:hello@atreoxai.com" style={{ color: '#00e676', textDecoration: 'none' }}>Get in touch</a>.
          </p>
        </div>
      </PageSection>

      <div style={{ padding: '0 5% 64px' }}><FooterBar setPage={setPage} /></div>
    </div>
  );
}

Object.assign(window, { FunctionsPage, PricingPage });
