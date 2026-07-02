
const React = window.React;
const { useState, useRef, useEffect } = React;
const {
  motion, useInView,
  ArrowUpRight, Zap, Shield, Globe, Brain,
  BlurText, FooterBar,
  Users,
} = window;

const MONO  = "'JetBrains Mono', monospace";
const SERIF = "'Playfair Display', Georgia, serif";
const GREEN = '#00e676';

/* ── Fake live activity feed data (visual only, no live connection) ── */
const FEED_ITEMS = [
  { time: '14:32:07', channel: '@CryptoAlphaCalls',  comment: 'this dip is exactly the kind of setup I was waiting for 👀', status: 'posted' },
  { time: '14:32:41', channel: '@Web3BuildersHub',   comment: 'anyone tried scaling this on L2 yet? curious about gas costs',  status: 'posted' },
  { time: '14:33:16', channel: '@AITradingSignals',  comment: 'the backtest numbers on this strategy look solid ngl',          status: 'posted' },
  { time: '14:33:58', channel: '@DeFiDegensChat',    comment: 'been looking for something exactly like this, saving the thread', status: 'queued' },
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
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', padding: isMobile ? '110px 5% 40px' : '160px 5% 80px', display: 'flex', gap: isMobile ? 32 : 64, alignItems: 'center', flexWrap: 'wrap' }}>

        {/* Left column */}
        <div style={{ flex: '1 1 400px', minWidth: 0 }}>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="overline" style={{ display: 'block', marginBottom: 22 }}>
            {'// '}Neuro-commenting for Telegram<span className="cursor" />
          </motion.p>
          <BlurText text="AI-powered Telegram growth, on autopilot."
            style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(2.7rem, 5.8vw, 4.4rem)', color: 'white', lineHeight: 1.08, letterSpacing: '-0.015em', maxWidth: 640, marginBottom: 28 }}
            delay={110}
          />
          <motion.p initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }} animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}
            style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.72)', maxWidth: 520, lineHeight: 1.65, marginBottom: 36 }}>
            ATREOX runs a network of AI accounts that post natural, context-aware comments on relevant crypto and tech channels — driving discovery, clicks, and growth to your project, on autopilot.
          </motion.p>
          <motion.div initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }} animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.1 }}
            style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', marginBottom: 30 }}>
            <a href="https://app.atreoxai.com" target="_self" className="btn-solid" style={{ padding: '15px 28px', fontSize: '0.8rem' }}>
              Enter panel <ArrowUpRight size={15} />
            </a>
            <button className="btn-outline" onClick={() => setPage('functions')} style={{ padding: '14px 24px' }}>
              See How It Works <ArrowUpRight size={14} />
            </button>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.7 }}
            style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.66rem', color: 'rgba(255,255,255,0.32)', letterSpacing: '0.08em' }}>
            Built for: crypto & tech channels · English-language market · 24/7 automation
          </motion.p>
        </div>

        {/* Right column — engine log terminal */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
          style={{ flex: '1 1 420px', minWidth: 0 }}>
          <div className="panel ticks" style={{ borderRadius: 6, padding: 0, overflow: 'hidden' }}>
            {/* Terminal header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderBottom: '1px solid rgba(0,230,118,0.14)', background: 'rgba(0,230,118,0.04)' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN, animation: 'pulse-dot 1.8s ease-in-out infinite', flexShrink: 0 }} />
              <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.66rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'white' }}>Live engine activity</span>
              <span style={{ marginLeft: 'auto', fontFamily: MONO, fontWeight: 400, fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)' }}>preview</span>
            </div>

            {/* Log rows */}
            <div>
              {FEED_ITEMS.map((item, i) => (
                <div key={i} style={{ padding: '13px 20px', borderBottom: '1px solid rgba(0,230,118,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.64rem', color: 'rgba(255,255,255,0.28)' }}>{item.time}</span>
                    <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.72rem', color: GREEN }}>{item.channel}</span>
                    <span style={{
                      marginLeft: 'auto', fontFamily: MONO, fontWeight: 500, fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                      color: item.status === 'posted' ? GREEN : 'rgba(255,255,255,0.38)',
                    }}>[{item.status}]</span>
                  </div>
                  <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.84rem', color: 'rgba(255,255,255,0.62)', lineHeight: 1.5 }}>"{item.comment}"</p>
                </div>
              ))}
            </div>

            {/* Stat readout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', background: 'rgba(0,230,118,0.03)' }}>
              {[
                { val: '42', label: 'Accounts active' },
                { val: '1,284', label: 'Comments today' },
                { val: '96', label: 'Channels tracked' },
              ].map(({ val, label }, i) => (
                <div key={i} style={{ padding: '16px 8px', textAlign: 'center', borderLeft: i > 0 ? '1px solid rgba(0,230,118,0.1)' : 'none' }}>
                  <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '1.45rem', color: GREEN, lineHeight: 1, marginBottom: 5, textShadow: '0 0 18px rgba(0,230,118,0.35)' }}>{val}</div>
                  <div style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.55rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{label}</div>
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
    <section ref={ref} className="section-block" style={{ padding: '88px 5%', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 64, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <motion.div style={{ flex: '1 1 320px' }}
          initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7 }}>
          <span className="overline" style={{ display: 'block', marginBottom: 18 }}>{'// '}Capabilities</span>
          <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(2.2rem, 4.2vw, 3.2rem)', color: 'white', lineHeight: 1.1, letterSpacing: '-0.01em', marginBottom: 22 }}>
            What ATREOX does
          </h2>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.72, marginBottom: 32 }}>
            A network of AI-driven Telegram accounts that discover the right channels and leave comments people actually read — driving organic discovery back to your project, day and night.
          </p>
          <button className="btn-solid" onClick={() => setPage('functions')} style={{ padding: '15px 30px', fontSize: '0.8rem' }}>
            Explore All Functions <ArrowUpRight size={15} />
          </button>
        </motion.div>

        <motion.div style={{ flex: '1 1 480px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}
          initial={{ opacity: 0, x: 30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.1 }}>
          {capabilities.map(({ icon: Icon, title, body }, i) => (
            <div key={i} className="panel panel-hover" style={{ padding: '26px 22px' }}>
              <div style={{ width: 42, height: 42, borderRadius: 5, background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <Icon size={19} color={GREEN} />
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
    { icon: Brain,  title: 'Comments that read the room', body: 'AI-generated replies match each channel\'s language and tone — not generic spam that gets deleted on sight.' },
    { icon: Shield, title: 'Built for account safety',    body: 'Warmup schedules, proxy rotation, and rate-limiting keep your accounts alive and undetected.' },
    { icon: Globe,  title: 'Finds the right channels',    body: 'Automatic discovery surfaces relevant crypto and tech channels — filtered, ranked, ready to target.' },
    { icon: Zap,    title: 'Live engine, real logs',      body: 'Watch the commenting engine work in real time from the dashboard — full visibility, full control.' },
  ];
  return (
    <section ref={ref} className="section-block" style={{ padding: '88px 5%', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
          <span className="overline" style={{ display: 'block', marginBottom: 16 }}>{'// '}The difference</span>
          <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(1.9rem, 3.8vw, 2.8rem)', color: 'white', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
            Why ATREOX is different
          </h2>
        </motion.div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
        {cards.map(({ icon: Icon, title, body }, i) => (
          <motion.div key={i} className="panel panel-hover"
            initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay: i * 0.09 }}
            style={{ padding: '30px 26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <div style={{ width: 46, height: 46, borderRadius: 5, background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={GREEN} />
              </div>
              <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.62rem', letterSpacing: '0.14em', color: 'rgba(0,230,118,0.4)' }}>{String(i + 1).padStart(2, '0')}</span>
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
    <section ref={ref} className="section-block" style={{ padding: '88px 5%', maxWidth: 1280, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}
        className="panel ticks" style={{ padding: 'clamp(64px, 9vw, 110px) 5%', textAlign: 'center' }}>
        <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(1.9rem, 4.2vw, 3.1rem)', color: 'white', letterSpacing: '-0.01em', lineHeight: 1.1, marginBottom: 16 }}>
          Ready to grow on Telegram?
        </h2>
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.55)', maxWidth: 420, margin: '0 auto 36px', lineHeight: 1.65 }}>
          Pick a plan and start driving traffic from the channels that matter — or explore what the platform can do first.
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

/* ── Section D: How neuro-commenting works ── */
function EducationalCtaSection({ setPage }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  return (
    <section ref={ref} className="section-block" style={{ padding: '88px 5%', maxWidth: 1280, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.65 }}
        className="panel"
        style={{ padding: 'clamp(36px, 6vw, 72px) clamp(24px, 5%, 80px)', display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <span className="overline" style={{ display: 'block', marginBottom: 18 }}>{'// '}How it works</span>
          <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(1.7rem, 3.3vw, 2.5rem)', color: 'white', lineHeight: 1.1, letterSpacing: '-0.01em', marginBottom: 14 }}>
            New to neuro-commenting?
          </h2>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.68, maxWidth: 480 }}>
            See exactly how the discovery, persona, and commenting engine fit together — and what happens under the hood on every account.
          </p>
        </div>
        <div style={{ flexShrink: 0 }}>
          <button className="btn-solid" onClick={() => setPage('functions')} style={{ padding: '15px 30px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
            See How Neuro-Commenting Works <ArrowUpRight size={15} />
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
      <div style={{ borderTop: '1px solid rgba(0,230,118,0.14)' }}>
        {faqs.map(({ q, a }, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.06 }}
            style={{ borderBottom: '1px solid rgba(0,230,118,0.14)' }}>
            <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', padding: '20px 6px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <span style={{ display: 'flex', alignItems: 'baseline', gap: 16, textAlign: 'left' }}>
                <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.62rem', letterSpacing: '0.1em', color: 'rgba(0,230,118,0.45)', flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.95rem', color: open === i ? '#00e676' : 'white', lineHeight: 1.4, transition: 'color 0.15s' }}>{q}</span>
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
