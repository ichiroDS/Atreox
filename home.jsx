
const React = window.React;
const { useState, useRef, useEffect } = React;
const {
  motion, useInView,
  ArrowUpRight, Zap, BarChart3, Check,
  BlurText, FadeTop, FadeBottom,
  SectionBadge, SectionHeading, GlassBtn, FooterBar,
  Code2, Layers, Users, ChevronDown,
} = window;

const SENA = '/public/showcase/sena/';

/* ── Hero ── */
function Hero({ setPage }) {
  const [scrollY, setScrollY]   = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [vidErr, setVidErr]     = useState(false);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const thumbs = [
    { src: SENA + 'hero-2.jpg',  top: 10,         right: 8,   rotate: '7deg',  speed: -0.04 },
    { src: SENA + 'hero-3.jpeg', bottom: 112,      right: 0,   rotate: '-5deg', speed:  0.05 },
    { src: SENA + 'hero-4.jpg',  top: 24,          left: 8,    rotate: '-8deg', speed:  0.03 },
    { src: SENA + 'hero-5.jpg',  bottom: 88,       left: 14,   rotate: '6deg',  speed: -0.03 },
    { src: SENA + 'hero-6.jpg',  bottom: 16,       left: 90,   rotate: '3deg',  speed:  0.04 },
  ];

  return (
    <section style={{ position: 'relative', overflow: 'hidden', minHeight: 900 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #000 0%, #000 80%, transparent 100%)', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', padding: isMobile ? '100px 5% 40px' : '150px 5% 80px', display: 'flex', gap: isMobile ? 32 : 64, alignItems: 'center', flexWrap: 'wrap' }}>

        {/* Left column */}
        <div style={{ flex: '1 1 400px', minWidth: 0 }}>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: 18 }}>
            The face is fake. The money is real.
          </motion.p>
          <BlurText text="Production-ready AI Influencer assets."
            style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(3rem, 6.5vw, 5rem)', color: 'white', lineHeight: 0.9, letterSpacing: '-3px', maxWidth: 620, marginBottom: 28 }}
            delay={110}
          />
          <motion.p initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }} animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}
            style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.72)', maxWidth: 500, lineHeight: 1.65, marginBottom: 36 }}>
            We build AI influencer characters that look real, post daily, and make money. You pick the face — we handle everything else.
          </motion.p>
          <motion.div initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }} animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.1 }}
            style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            <button className="btn-gradient" onClick={() => setPage('pricing')} style={{ borderRadius: 9999, padding: '13px 28px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              Pricing <ArrowUpRight size={16} />
            </button>
            <button className="liquid-glass btn-glass-hover" onClick={() => setPage('how-it-works')} style={{ borderRadius: 9999, padding: '13px 24px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'rgba(255,255,255,0.07)' }}>
              How It Works <ArrowUpRight size={15} />
            </button>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.7 }}
            style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.02em' }}>
            Built on: Flux 1.dev · WAN 2.2 · ComfyUI · RunPod
          </motion.p>
        </div>

        {/* Right column */}
        {!isMobile ? (
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
            style={{ flex: '0 0 480px', position: 'relative', height: 640, flexShrink: 0 }}>
            {/* Main video card */}
            <div className="liquid-glass glass-card-interactive" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 50, width: 250, height: 444, borderRadius: 20, overflow: 'hidden', zIndex: 5 }}>
              {vidErr ? (
                <img src={SENA + 'hero-1.jpg'} alt="Sena" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <video autoPlay muted loop playsInline onError={() => setVidErr(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  src={SENA + 'hero-video.mp4'}
                />
              )}
            </div>
            {/* Floating thumbnails */}
            {thumbs.map(({ src, top, bottom, left, right, rotate, speed }, i) => (
              <div key={i} className="liquid-glass"
                style={{
                  position: 'absolute', borderRadius: 12, overflow: 'hidden',
                  width: 112, aspectRatio: '3/4',
                  ...(top    !== undefined && { top }),
                  ...(bottom !== undefined && { bottom }),
                  ...(left   !== undefined && { left }),
                  ...(right  !== undefined && { right }),
                  transform: `rotate(${rotate}) translateY(${scrollY * speed}px)`,
                  zIndex: i < 2 ? 6 : 4,
                  opacity: 0.88,
                  boxShadow: '0 8px 28px rgba(0,0,0,0.45)',
                }}>
                <img src={src} loading="lazy" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}
            style={{ flex: '1 1 100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { src: SENA + 'hero-2.jpg',     type: 'img' },
              { src: SENA + 'hero-3.jpeg',    type: 'img' },
              { src: SENA + 'hero-4.jpg',     type: 'img' },
              { src: SENA + 'hero-video.mp4', type: 'vid' },
            ].map(({ src, type }, i) => (
              <div key={i} className="liquid-glass" style={{ borderRadius: 14, overflow: 'hidden', aspectRatio: '3/4' }}>
                {type === 'img' ? (
                  <img src={src} loading="lazy" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <video autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} src={src} />
                )}
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

/* ── Section A: What ATREOX delivers ── */
function FeatureHeroSection({ setPage }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  const deliverItems = [
    { src: SENA + 'delivers-1.jpg', type: 'img' },
    { src: SENA + 'delivers-2.jpg', type: 'img' },
    { src: SENA + 'delivers-3.jpg', type: 'img' },
    { src: SENA + 'delivers-4.jpg', type: 'img' },
    { src: SENA + 'delivers-5.jpg', type: 'img' },
    { src: SENA + 'b-roll.mp4',     type: 'vid' },
  ];

  return (
    <section ref={ref} data-bg-palette="blue-violet" className="section-block" style={{ padding: '80px 5%', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 64, alignItems: 'center', flexWrap: 'wrap' }}>
        <motion.div style={{ flex: '1 1 340px' }}
          initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7 }}>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', color: 'white', lineHeight: 1.06, letterSpacing: '-0.03em', marginBottom: 22 }}>
            What ATREOX delivers
          </h2>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.72, marginBottom: 22 }}>
            Pre-trained Flux character models. WAN video LoRAs. Custom anti-plastic-skin nodes. Each package is RunPod-ready — generate the same day you buy. No theory. No fluff. Just shippable assets.
          </p>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: 'rgba(255,255,255,0.32)', marginBottom: 32, lineHeight: 1.65 }}>
            Built by Dmytro · Public build journey · Founder-tier pricing for early access
          </p>
          <button className="btn-gradient" onClick={() => setPage('pricing')} style={{ borderRadius: 9999, padding: '14px 30px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            Browse Packages <ArrowUpRight size={16} />
          </button>
        </motion.div>

        <motion.div style={{ flex: '1 1 380px' }}
          initial={{ opacity: 0, x: 30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.1 }}>
          <div className="delivers-grid">
            {deliverItems.map(({ src, type }, i) => (
              <div key={i} className="liquid-glass glass-card-interactive" style={{ borderRadius: 16, overflow: 'hidden', aspectRatio: '3/4', position: 'relative' }}>
                {type === 'img' ? (
                  <img src={src} loading="lazy" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <video autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} src={src} />
                )}
              </div>
            ))}
          </div>
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
    { icon: Layers,   color: '#4f8ef7', title: 'Production assets, not theory',  body: 'Ready-to-use Flux fine-tunes and WAN LoRAs. Generate from minute one — no datasets, no training, no waiting.' },
    { icon: BarChart3, color: '#a78bfa', title: 'Built on real revenue',           body: 'Sena Xo, my own AI character, makes money on Telegram and Fanvue. The exact pipeline I use is what you get.' },
    { icon: Code2,    color: '#34d399', title: 'Custom ComfyUI nodes',            body: "Bundled with packages — anti-plastic-skin postprocess, anatomy fix, ATREOX-only nodes you won't find anywhere else." },
    { icon: Users,    color: '#f59e0b', title: 'Closed-loop community',           body: 'Inner Circle Discord launching mid-May. Monthly LoRA drops, NSFW techniques, my live build journal.' },
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
          Ready to launch your first AI character?
        </h2>
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.55)', maxWidth: 400, margin: '0 auto 36px', lineHeight: 1.65 }}>
          Pick a production-ready package or start with the course.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-gradient" onClick={() => setPage('pricing')} style={{ borderRadius: 9999, padding: '14px 32px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            Browse Packages <ArrowUpRight size={16} />
          </button>
          <button className="liquid-glass btn-glass-hover" onClick={() => setPage('pricing')} style={{ borderRadius: 9999, padding: '14px 28px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'rgba(255,255,255,0.07)' }}>
            Get the Course <ArrowUpRight size={15} />
          </button>
        </div>
      </motion.div>
    </section>
  );
}

/* ── Section D: Educational CTA ── */
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
          <div style={{ display: 'inline-block', background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.25)', borderRadius: 9999, padding: '4px 14px', marginBottom: 18 }}>
            <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.7rem', color: '#4f8ef7', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Education</span>
          </div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', color: 'white', lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 14 }}>
            New to AI character creation?
          </h2>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.68, maxWidth: 480 }}>
            Don't buy blind. Read the honest breakdown of what we sell, what it costs, and how to choose.
          </p>
        </div>
        <div style={{ flexShrink: 0 }}>
          <button className="btn-gradient" onClick={() => setPage('how-it-works')}
            style={{ borderRadius: 9999, padding: '14px 32px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Read: How ATREOX works <ArrowUpRight size={16} />
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
    { q: 'Is this a course or a product I can use immediately?',
      a: 'Both. ATREOX sells production-ready Flux models and WAN LoRAs you can generate with on day one. The course teaches you to build your own pipeline from scratch.' },
    { q: "What's included in a Character Package?",
      a: 'A Flux fine-tune of the character + WAN video LoRA + RunPod-ready setup guide + access to ATREOX custom nodes. Limited and Exclusive tiers add bundled extras.' },
    { q: 'Do I need an NVIDIA GPU?',
      a: "No — all packages are designed to run on RunPod. Setup guide included, you'll be generating in under 30 minutes." },
    { q: 'Can I use this for NSFW content?',
      a: 'Yes. NSFW workflows and anatomy LoRAs are included in the course bonus module and Inner Circle community.' },
    { q: 'Is there ongoing support?',
      a: 'Inner Circle members get monthly LoRA drops, weekly Q&A access, and direct DM with me. Launching mid-May.' },
  ];
  return (
    <section ref={ref} data-bg-palette="sky-blue" className="section-block" style={{ padding: '80px 5%', maxWidth: 900, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', color: 'white', letterSpacing: '-0.03em', marginBottom: 10 }}>
          Frequently Asked Questions
        </h2>
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)' }}>
          Everything you need to know before you buy
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
