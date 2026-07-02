
const React = window.React;
const { useState, useRef, useEffect } = React;
const {
  motion, useInView,
  ArrowUpRight, Zap, Shield, Globe, Brain,
  BlurText, FooterBar,
  Users, ChevronDown,
} = window;

/* ── Fake live activity feed data (visual only, no live connection) ── */
const FEED_ITEMS = [
  { channel: '@CryptoAlphaCalls',  comment: 'this dip is exactly the kind of setup I was waiting for 👀', status: 'posted' },
  { channel: '@Web3BuildersHub',   comment: 'anyone tried scaling this on L2 yet? curious about gas costs',  status: 'posted' },
  { channel: '@AITradingSignals',  comment: 'the backtest numbers on this strategy look solid ngl',          status: 'posted' },
  { channel: '@DeFiDegensChat',    comment: 'been looking for something exactly like this, saving the thread', status: 'queued' },
];

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
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #000 0%, #000 80%, transparent 100%)', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', padding: isMobile ? '100px 5% 40px' : '150px 5% 80px', display: 'flex', gap: isMobile ? 32 : 64, alignItems: 'center', flexWrap: 'wrap' }}>

        {/* Left column */}
        <div style={{ flex: '1 1 400px', minWidth: 0 }}>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: 18 }}>
            Neuro-commenting for Telegram
          </motion.p>
          <BlurText text="AI-powered Telegram growth, on autopilot."
            style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(3rem, 6.5vw, 5rem)', color: 'white', lineHeight: 0.95, letterSpacing: '-3px', maxWidth: 620, marginBottom: 28 }}
            delay={110}
          />
          <motion.p initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }} animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}
            style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.72)', maxWidth: 520, lineHeight: 1.65, marginBottom: 36 }}>
            ATREOX runs a network of AI accounts that post natural, context-aware comments on relevant crypto and tech channels — driving discovery, clicks, and growth to your project, on autopilot.
          </motion.p>
          <motion.div initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }} animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.1 }}
            style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            <a href="https://app.atreoxai.com" target="_self" className="btn-gradient" style={{ borderRadius: 9999, padding: '13px 28px', border: 'none', color: 'white', textDecoration: 'none', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              Enter panel <ArrowUpRight size={16} />
            </a>
            <button className="liquid-glass btn-glass-hover" onClick={() => setPage('functions')} style={{ borderRadius: 9999, padding: '13px 24px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'rgba(255,255,255,0.07)' }}>
              See How It Works <ArrowUpRight size={15} />
            </button>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.7 }}
            style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.02em' }}>
            Built for: crypto & tech channels · English-language market · 24/7 automation
          </motion.p>
        </div>

        {/* Right column — live activity mockup */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
          style={{ flex: '1 1 420px', minWidth: 0 }}>
          <div className="liquid-glass-strong glass-card-interactive" style={{ borderRadius: 24, padding: '24px', border: '1px solid rgba(0,230,118,0.14)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00e676', animation: 'pulse-dot 1.8s ease-in-out infinite' }} />
              <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.8rem', color: 'white' }}>Live engine activity</span>
              <span style={{ marginLeft: 'auto', fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>preview</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {FEED_ITEMS.map((item, i) => (
                <div key={i} className="liquid-glass" style={{ borderRadius: 14, padding: '13px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.78rem', color: '#00e676' }}>{item.channel}</span>
                    <span style={{
                      fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.62rem', letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: item.status === 'posted' ? 'rgba(0,230,118,0.9)' : 'rgba(255,255,255,0.4)',
                    }}>{item.status}</span>
                  </div>
                  <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>"{item.comment}"</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { val: '42', label: 'Accounts active' },
                { val: '1,284', label: 'Comments today' },
                { val: '96', label: 'Channels tracked' },
              ].map(({ val, label }, i) => (
                <div key={i} className="liquid-glass" style={{ borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.3rem', color: 'white', marginBottom: 2 }}>{val}</div>
                  <div style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.02em' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Section A: What ATREOX does ── */
function FeatureHeroSection({ setPage }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  const capabilities = [
    { icon: Brain,  title: 'Contextual AI comments',    body: 'Every comment is generated to match the channel\'s language, tone, and topic — not a copy-pasted template.' },
    { icon: Globe,  title: 'Automatic channel discovery', body: 'ATREOX finds and ranks relevant crypto and tech channels for you, so you\'re never guessing where to show up.' },
    { icon: Shield, title: 'Multi-account management',  body: 'Bulk-import accounts, run anti-ban warmup schedules, and rotate proxies — all from one dashboard.' },
    { icon: Users,  title: 'Persona customization',      body: 'Define tone, vocabulary, and posting behavior per persona so every account feels like a real person.' },
  ];

  return (
    <section ref={ref} data-bg-palette="blue-violet" className="section-block" style={{ padding: '80px 5%', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 64, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <motion.div style={{ flex: '1 1 320px' }}
          initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7 }}>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', color: 'white', lineHeight: 1.06, letterSpacing: '-0.03em', marginBottom: 22 }}>
            What ATREOX does
          </h2>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.72, marginBottom: 32 }}>
            A network of AI-driven Telegram accounts that discover the right channels and leave comments people actually read — driving organic discovery back to your project, day and night.
          </p>
          <button className="btn-gradient" onClick={() => setPage('functions')} style={{ borderRadius: 9999, padding: '14px 30px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            Explore All Functions <ArrowUpRight size={16} />
          </button>
        </motion.div>

        <motion.div style={{ flex: '1 1 480px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}
          initial={{ opacity: 0, x: 30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.1 }}>
          {capabilities.map(({ icon: Icon, title, body }, i) => (
            <div key={i} className="liquid-glass glass-card-interactive" style={{ borderRadius: 18, padding: '24px 22px' }}>
              <div className="feature-icon-wrap" style={{ width: 42, height: 42, borderRadius: 11, background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Icon size={19} color="#00e676" />
              </div>
              <h4 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.92rem', color: 'white', marginBottom: 8 }}>{title}</h4>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{body}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ── Section B: Why ATREOX is different ── */
function WhyChooseSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const cards = [
    { icon: Brain,      color: '#00e676', title: 'Comments that read the room', body: 'AI-generated replies match each channel\'s language and tone — not generic spam that gets deleted on sight.' },
    { icon: Shield,     color: '#00bfa5', title: 'Built for account safety',    body: 'Warmup schedules, proxy rotation, and rate-limiting keep your accounts alive and undetected.' },
    { icon: Globe,      color: '#00c853', title: 'Finds the right channels',    body: 'Automatic discovery surfaces relevant crypto and tech channels — filtered, ranked, ready to target.' },
    { icon: Zap,        color: '#1de9b6', title: 'Live engine, real logs',      body: 'Watch the commenting engine work in real time from the dashboard — full visibility, full control.' },
  ];
  return (
    <section ref={ref} data-bg-palette="crimson" className="section-block" style={{ padding: '80px 5%', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
          style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'white', letterSpacing: '-0.03em', lineHeight: 1.05 }}>
          Why ATREOX is different
        </motion.h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
        {cards.map(({ icon: Icon, color, title, body }, i) => (
          <motion.div key={i} className="liquid-glass glass-card-interactive"
            initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay: i * 0.09 }}
            style={{ borderRadius: 20, padding: '30px 26px', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="feature-icon-wrap" style={{ width: 48, height: 48, borderRadius: 12, background: `${color}14`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Icon size={20} color={color} />
            </div>
            <h4 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.95rem', color: 'white', marginBottom: 10 }}>{title}</h4>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>{body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ── Section C: CTA Banner ── */
function CtaBannerSection({ setPage }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  return (
    <section ref={ref} data-bg-palette="blue-rose" className="section-block" style={{ padding: '80px 5%', maxWidth: 1280, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}
        className="liquid-glass section-block" style={{ borderRadius: 28, padding: '80px 5%', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(2rem, 4.5vw, 3.4rem)', color: 'white', letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 16 }}>
          Ready to grow on Telegram?
        </h2>
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.55)', maxWidth: 420, margin: '0 auto 36px', lineHeight: 1.65 }}>
          Pick a plan and start driving traffic from the channels that matter — or explore what the platform can do first.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-gradient" onClick={() => setPage('pricing')} style={{ borderRadius: 9999, padding: '14px 32px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            See Pricing <ArrowUpRight size={16} />
          </button>
          <button className="liquid-glass btn-glass-hover" onClick={() => setPage('functions')} style={{ borderRadius: 9999, padding: '14px 28px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'rgba(255,255,255,0.07)' }}>
            Explore Functions <ArrowUpRight size={15} />
          </button>
        </div>
      </motion.div>
    </section>
  );
}

/* ── Section D: How neuro-commenting works ── */
function EducationalCtaSection({ setPage }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  return (
    <section ref={ref} data-bg-palette="indigo" className="section-block" style={{ padding: '80px 5%', maxWidth: 1280, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.65 }}
        className="liquid-glass"
        style={{ borderRadius: 24, padding: 'clamp(36px, 6vw, 72px) clamp(24px, 5%, 80px)', display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <div style={{ display: 'inline-block', background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.25)', borderRadius: 9999, padding: '4px 14px', marginBottom: 18 }}>
            <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.7rem', color: '#00e676', letterSpacing: '0.07em', textTransform: 'uppercase' }}>How it works</span>
          </div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', color: 'white', lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 14 }}>
            New to neuro-commenting?
          </h2>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.68, maxWidth: 480 }}>
            See exactly how the discovery, persona, and commenting engine fit together — and what happens under the hood on every account.
          </p>
        </div>
        <div style={{ flexShrink: 0 }}>
          <button className="btn-gradient" onClick={() => setPage('functions')}
            style={{ borderRadius: 9999, padding: '14px 32px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            See How Neuro-Commenting Works <ArrowUpRight size={16} />
          </button>
        </div>
      </motion.div>
    </section>
  );
}

/* ── Section E: FAQ ── */
function FAQSection() {
  const ref  = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const [open, setOpen] = React.useState(null);
  const faqs = [
    { q: 'How does account safety work?',
      a: 'Every account goes through a gradual warmup schedule before it starts commenting, and traffic is routed through rotating proxies with built-in rate limits. The Account Manager continuously runs health checks and pauses any account that shows risk signals, so you never lose a warmed-up account to a ban.' },
    { q: "What's the setup process?",
      a: 'Connect your Telegram accounts (or import ones you already have), let the Channel Parser run a discovery pass to find relevant crypto and tech channels, configure a persona and comment style, and launch. Most users are live within an hour.' },
    { q: 'Can I bring my own Telegram accounts?',
      a: "Yes — bulk-import your own accounts via the Account Manager. They'll go through the same warmup and health-check pipeline as any other account before commenting begins." },
    { q: 'Does this only work for crypto and tech channels?',
      a: "ATREOX is built and tuned for the English-language crypto and tech niches, where it performs best. Channel filters are configurable if you want to point discovery at adjacent niches." },
    { q: 'Is there a contract, or can I cancel anytime?',
      a: "It's a monthly subscription — no long-term contract. Cancel anytime from the dashboard and you'll keep access through the end of your billing period." },
  ];
  return (
    <section ref={ref} data-bg-palette="sky-blue" className="section-block" style={{ padding: '80px 5%', maxWidth: 900, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', color: 'white', letterSpacing: '-0.03em', marginBottom: 10 }}>
          Frequently Asked Questions
        </h2>
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)' }}>
          Everything you need to know before you start
        </p>
      </motion.div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {faqs.map(({ q, a }, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.06 }}
            className="liquid-glass" style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
            <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', padding: '18px 22px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.9rem', color: 'white', textAlign: 'left', lineHeight: 1.4 }}>{q}</span>
              <div style={{ transition: 'transform 0.25s ease', transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
                <ChevronDown size={16} color="rgba(255,255,255,0.4)" />
              </div>
            </button>
            {open === i && (
              <div className="faq-answer" style={{ padding: '0 22px 18px' }}>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 14 }} />
                <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.86rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{a}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}


/* ── Home Page ── */
function HomePage({ setPage }) {
  return (
    <div>
      <Hero setPage={setPage} />
      <FeatureHeroSection setPage={setPage} />
      <WhyChooseSection />
      <CtaBannerSection setPage={setPage} />
      <EducationalCtaSection setPage={setPage} />
      <FAQSection />
      <div style={{ padding: '0 5% 60px' }}>
        <FooterBar setPage={setPage} />
      </div>
    </div>
  );
}

Object.assign(window, { HomePage });
