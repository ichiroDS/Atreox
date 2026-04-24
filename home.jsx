
const React = window.React;
const { useState, useRef, useEffect } = React;
const {
  motion, useInView, AnimatePresence,
  ArrowUpRight, Play, Zap, BarChart3, Check,
  Navbar, BlurText, FadeTop, FadeBottom,
  NodeWorkflow, SectionBadge, SectionHeading, GlassBtn, FooterBar,
  Brain, Cpu, GitBranch, Code2, Layers, Globe, Clock, MessageSquare, Star, ChevronDown, Users, BookOpen
} = window;

const HLS_CTA  = 'https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8';
const HERO_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4';

/* ── Striped placeholder ── */
function ImgPlaceholder({ label, aspect = '4/3', style }) {
  return (
    <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', aspectRatio: aspect, background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }}>
        <defs>
          <pattern id="strp" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="12" stroke="white" strokeWidth="5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#strp)" />
      </svg>
      <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '0 20px', position: 'relative' }}>{label}</span>
    </div>
  );
}

/* ── Hero ── */
function Hero({ setPage }) {
  const videoRef = useRef(null);
  useEffect(() => {
    const v = videoRef.current;
    if (v) v.play().catch(() => {});
  }, []);
  return (
    <section style={{ position: 'relative', overflow: 'hidden', height: 1000 }}>
      {/* Black base that fades to transparent at bottom for smooth transition */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #000 0%, #000 78%, transparent 100%)', zIndex: 0 }} />
      <video ref={videoRef} loop muted playsInline
        style={{ position: 'absolute', left: 0, width: '100%', height: 'auto', objectFit: 'contain', zIndex: 0, top: '18%' }}
        src={HERO_VIDEO}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.18)', zIndex: 1 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 340, background: 'linear-gradient(to bottom, transparent, black)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 160, paddingLeft: 24, paddingRight: 24 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="liquid-glass" style={{ borderRadius: 9999, padding: '4px 4px', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
            <span style={{ background: 'white', color: 'black', borderRadius: 9999, padding: '3px 12px', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'Barlow, sans-serif' }}>New</span>
            <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', paddingRight: 10 }}>ComfyUI Advanced Curriculum is live.</span>
          </div>
        </motion.div>
        <BlurText text="Master the Nodes. Control the Chaos."
          style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(3.2rem, 7vw, 5.5rem)', color: 'white', lineHeight: 0.88, letterSpacing: '-3px', maxWidth: 820, marginBottom: 28 }}
          delay={110}
        />
        <motion.p initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }} animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}
          style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.72)', maxWidth: 520, lineHeight: 1.6, marginBottom: 40 }}>
          The definitive ComfyUI academy for cinematic AI generation. Turn complex workflows into production-grade assets.
        </motion.p>
        <motion.div initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }} animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.1 }}
          style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn-gradient" onClick={() => setPage('courses')} style={{ borderRadius: 9999, padding: '13px 28px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            Explore Courses <ArrowUpRight size={16} />
          </button>
          <button onClick={() => setPage('about')} style={{ background: 'none', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', opacity: 0.8 }}>
            About Us <ArrowUpRight size={15} />
          </button>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.8 }}
          style={{ marginTop: 'auto', paddingTop: 80, paddingBottom: 32, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div className="liquid-glass" style={{ borderRadius: 9999, padding: '6px 18px', fontSize: '0.72rem', fontFamily: 'Barlow, sans-serif', fontWeight: 400, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>
            Trusted by pioneers of
          </div>
          {['Midjourney', 'Stable Diffusion', 'RunPod', 'JarvisLabs'].map(p => (
            <span key={p} style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(1.1rem, 2.5vw, 1.6rem)', color: 'white', opacity: 0.85 }}>{p}</span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ── Section A: Feature Hero (Image 2 style) ── */
function FeatureHeroSection({ setPage }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  return (
    <section ref={ref} data-bg-palette="blue-violet" style={{ padding: '100px 5%', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 64, alignItems: 'center', flexWrap: 'wrap' }}>
        <motion.div style={{ flex: '1 1 360px' }}
          initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7 }}>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', color: 'white', lineHeight: 1.06, letterSpacing: '-0.03em', marginBottom: 22 }}>
            Master Photoreal AI<br />Influencer Creation
          </h2>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.72, marginBottom: 22 }}>
            Create hyper-realistic AI personas with perfect consistency. Master Flux Dev + ComfyUI to build influencers that feel completely real.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32, flexWrap: 'wrap' }}>
            {['645+ students', '4.7/5 rating', 'Pro quality from day one'].map((s, i) => (
              <span key={i} style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: 'rgba(255,255,255,0.42)', paddingRight: i < 2 ? 14 : 0, marginRight: i < 2 ? 14 : 0, borderRight: i < 2 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>{s}</span>
            ))}
          </div>
          <button className="btn-gradient" onClick={() => setPage('courses')} style={{ borderRadius: 9999, padding: '14px 30px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            Get Instant Access <ArrowUpRight size={16} />
          </button>
        </motion.div>
        <motion.div style={{ flex: '1 1 380px' }}
          initial={{ opacity: 0, x: 30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.1 }}>
          <div className="liquid-glass glass-card-interactive" style={{ borderRadius: 24, overflow: 'hidden', aspectRatio: '4/3', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ImgPlaceholder label="AI influencer showcase — drop product image here" aspect="4/3" style={{ width: '100%', height: '100%', borderRadius: 0, aspectRatio: 'auto', position: 'absolute', inset: 0 }} />
            {/* Floating stat pill */}
            <div className="liquid-glass-strong" style={{ position: 'absolute', bottom: 20, left: 20, borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', gap: 2 }}>{[...Array(5)].map((_,j)=><span key={j} style={{fontSize:'0.7rem',color:'#f59e0b'}}>★</span>)}</div>
              <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.78rem', color: 'white' }}>4.7/5 from 645 students</span>
            </div>
          </div>
          {/* Slide dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
            {[true, false, false].map((a, i) => <div key={i} style={{ width: a ? 24 : 8, height: 8, borderRadius: 9999, background: a ? 'white' : 'rgba(255,255,255,0.2)', transition: 'all 0.3s' }} />)}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Section B: Course Showcase (Image 3 style) ── */
function CourseShowcaseSection({ setPage }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const bullets = [
    'Generate photoreal influencer images instantly',
    'High realism with private models & LoRAs',
    'No complex installations — fully web-based',
    'NSFW creative freedom, fully uncensored',
  ];
  return (
    <section ref={ref} data-bg-palette="forest-green" style={{ padding: '80px 5%', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 64, alignItems: 'center', flexWrap: 'wrap' }}>
        <motion.div style={{ flex: '1 1 360px' }}
          initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7 }}>
          <SectionBadge>Blueprint Course</SectionBadge>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: 'white', lineHeight: 1.06, letterSpacing: '-0.02em', marginTop: 18, marginBottom: 18 }}>
            Generate AI<br />Influencers Instantly
          </h2>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.72, marginBottom: 24 }}>
            Generate stunning AI influencer images and videos using our latest private models and LoRAs. Upload 1 reference image and create instantly.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 32 }}>
            {bullets.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(79,142,247,0.14)', border: '1px solid rgba(79,142,247,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4f8ef7" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>{b}</span>
              </div>
            ))}
          </div>
          <button className="liquid-glass btn-glass-hover" onClick={() => setPage('courses')} style={{ borderRadius: 9999, padding: '12px 24px', border: 'none', color: 'rgba(255,255,255,0.7)', fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'rgba(255,255,255,0.07)' }}>
            Course coming live 2026
          </button>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.75rem', color: 'rgba(255,255,255,0.28)', marginTop: 12 }}>
            Coming 2026 • No installation required • Web-based platform
          </p>
        </motion.div>
        <motion.div style={{ flex: '1 1 380px' }}
          initial={{ opacity: 0, x: 30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.12 }}>
          <div className="liquid-glass glass-card-interactive" style={{ borderRadius: 24, overflow: 'hidden', aspectRatio: '3/4', position: 'relative', background: 'rgba(255,255,255,0.02)' }}>
            <ImgPlaceholder label="Product / course cover art — drop image here" aspect="3/4" style={{ width: '100%', height: '100%', borderRadius: 0, aspectRatio: 'auto', position: 'absolute', inset: 0 }} />
            <div style={{ position: 'absolute', bottom: 28, left: 28, right: 28 }}>
              <div className="liquid-glass-strong" style={{ borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.4rem', color: 'white', marginBottom: 4 }}>ATREOX AI</div>
                <div style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em' }}>INFLUENCER BLUEPRINT</div>
              </div>
            </div>
            <div style={{ position: 'absolute', top: 20, right: 20 }}>
              <div style={{ background: 'linear-gradient(135deg,#4f8ef7,#a78bfa)', borderRadius: 9999, padding: '4px 12px' }}>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.65rem', color: 'white', letterSpacing: '0.06em' }}>COMING 2026</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Section C: Why Choose (Image 4 style) ── */
function WhyChooseSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const cards = [
    { icon: BookOpen,     color: '#4f8ef7', title: '100% Practical Workflows', body: 'All courses are built around real ComfyUI workflows. No theory without a working pipeline you can ship.' },
    { icon: Code2,        color: '#a78bfa', title: 'Built for ComfyUI', body: 'Learn the platform becoming the industry standard for professional AI image generation workflows.' },
    { icon: Zap,          color: '#34d399', title: 'Step-by-step Tutorials', body: 'Real techniques from successful AI influencer creators. No fluff — just proven methods that work.' },
    { icon: Users,        color: '#f59e0b', title: 'Active Community', body: 'Join thousands of creators sharing workflows, tips, and updates. New content added every month.' },
  ];
  return (
    <section ref={ref} data-bg-palette="crimson" style={{ padding: '80px 5%', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
          style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: 'white', letterSpacing: '-0.02em' }}>
          Why Thousands Choose ATREOX AI
        </motion.h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
        {cards.map(({ icon: Icon, color, title, body }, i) => (
          <motion.div key={i} className="liquid-glass glass-card-interactive"
            initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay: i * 0.09 }}
            style={{ borderRadius: 20, padding: '30px 26px', border: `1px solid rgba(255,255,255,0.07)` }}>
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

/* ── Section D: CTA Banner (Image 5 style) ── */
function CtaBannerSection({ setPage }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  return (
    <section ref={ref} data-bg-palette="blue-rose" style={{ padding: '0 5%', maxWidth: 1280, margin: '0 auto 80px' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}
        className="liquid-glass" style={{ borderRadius: 28, padding: '80px 5%', textAlign: 'center', background: 'rgba(10,14,30,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h2 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 0 }}>
          Ready to Create Your First
        </h2>
        <h2 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 24, background: 'linear-gradient(90deg, #4f8ef7, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Viral AI Influencer?
        </h2>
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.55)', maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.65 }}>
          Join thousands of creators mastering ComfyUI. Start your AI influencer course now and see results from day one.
        </p>
        <button className="btn-gradient" onClick={() => setPage('courses')} style={{ borderRadius: 9999, padding: '14px 32px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          Start Course Now <ArrowUpRight size={16} />
        </button>
      </motion.div>
    </section>
  );
}

/* ── Section E: Testimonials (Image 6 style) ── */
function TestimonialsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const quotes = [
    { text: 'This course completely transformed my workflow. I went from struggling with basic ComfyUI to creating viral AI influencers in just 2 weeks. The step-by-step approach is perfect for beginners.', name: 'Sarah Chen', role: 'AI Content Creator' },
    { text: 'Best free course I\'ve ever taken. The Flux + SDXL workflows are professional-grade, and the community support is incredible. Highly recommend to anyone serious about AI influencer creation.', name: 'Marcus Rodriguez', role: 'Digital Artist' },
    { text: 'I was skeptical at first, but this exceeded all expectations. The quality rivals paid courses, and I\'ve already monetized my AI influencers. Thank you ATREOX AI!', name: 'Emily Johnson', role: 'Social Media Manager' },
  ];
  return (
    <section ref={ref} data-bg-palette="rose-violet" style={{ padding: '80px 5%', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
          style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: 'white', letterSpacing: '-0.02em' }}>
          Join others transforming their lives through learning
        </motion.h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {quotes.map(({ text, name, role }, i) => (
          <motion.div key={i} className="liquid-glass testimonial-card"
            initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: i * 0.12 }}
            style={{ borderRadius: 20, padding: '32px 28px', border: '1px solid rgba(255,255,255,0.07)' }}>
            {/* Quote icon */}
            <div style={{ marginBottom: 14 }}>
              <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
                <path d="M0 22V13.2C0 5.73 4.48 1.47 13.44 0L14.56 2.16C10.4 3.15 8.32 5.33 8.32 8.7H13.44V22H0ZM14.56 22V13.2C14.56 5.73 19.04 1.47 28 0L29.12 2.16C24.96 3.15 22.88 5.33 22.88 8.7H28V22H14.56Z" fill="#a78bfa" opacity="0.7"/>
              </svg>
            </div>
            <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
              {[...Array(5)].map((_, j) => <span key={j} style={{ fontSize: '0.85rem', color: '#f59e0b' }}>★</span>)}
            </div>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.72, marginBottom: 24 }}>
              "{text}"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(79,142,247,0.3), rgba(167,139,250,0.3))', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1rem', color: 'rgba(255,255,255,0.6)' }}>{name[0]}</span>
              </div>
              <div>
                <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.85rem', color: 'white' }}>{name}</p>
                <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ── Section F: FAQ (Image 7 style) ── */
function FAQSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const [open, setOpen] = React.useState(null);
  const faqs = [
    { q: 'Is this course suitable for complete beginners?', a: 'Absolutely. The course starts from scratch — we assume no prior ComfyUI or AI experience. Every step is explained clearly with screen recordings and downloadable workflow files.' },
    { q: "What if I don't have an NVIDIA graphics card?", a: 'No problem. The course covers cloud GPU options via RunPod and JarvisLabs, so you can run every workflow without a local GPU. We also cover Google Colab setups.' },
    { q: 'Will this course help me create an AI influencer for Instagram or TikTok?', a: 'Yes. The entire blueprint is designed for social media. You\'ll learn to generate consistent, high-quality images and videos that perform on platforms like Instagram, TikTok, and YouTube.' },
    { q: 'What resources will I have access to in the course?', a: 'You get all workflow files, model download links, a private Discord community, live Q&A sessions, and 4 new lessons added every month to keep you at the cutting edge.' },
    { q: 'How do I make my AI model more lifelike and consistent across images?', a: 'We dedicate an entire module to consistency techniques — using LoRAs, face locking, IP-Adapter, and reference image workflows to keep your character recognizable across any scene.' },
    { q: 'Is ComfyUI installation difficult?', a: 'Not with our guide. We provide a step-by-step installer walkthrough for Windows, Mac, and cloud environments. Most students are up and running in under 30 minutes.' },
    { q: 'What is ComfyUI, and how does it compare to other interfaces?', a: 'ComfyUI is a node-based UI for Stable Diffusion that gives you total control over every step of the generation process. Unlike Automatic1111 or Forge, it\'s infinitely flexible and the industry standard for professional workflows.' },
  ];
  return (
    <section ref={ref} data-bg-palette="sky-blue" style={{ padding: '80px 5%', maxWidth: 900, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', color: 'white', letterSpacing: '-0.03em', marginBottom: 10 }}>
          Frequently Asked Questions
        </h2>
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)' }}>
          Everything you need to know about our courses and platform
        </p>
      </motion.div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {faqs.map(({ q, a }, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.06 }}
            className="liquid-glass" style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
            <button onClick={() => setOpen(open === i ? null : i)} style={{
              width: '100%', padding: '18px 22px', background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
            }}>
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

/* ── CTA + Footer ── */
function CtaFooter({ setPage }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  return (
    <section data-bg-palette="indigo" style={{ position: 'relative', overflow: 'hidden', minHeight: 600, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {/* Subtle dark overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,5,20,0.65)', zIndex: 0 }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(79,142,247,0.07) 0%, transparent 70%)', zIndex: 1 }} />
      <FadeTop /> <FadeBottom />
      <div ref={ref} style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '100px 5%' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
          <SectionBadge>Start Today</SectionBadge>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.1 }}>
          <BlurText text="Your next pipeline starts here." style={{
            fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
            fontSize: 'clamp(2.8rem, 6vw, 5rem)', color: 'white',
            lineHeight: 0.88, letterSpacing: '-2px', marginTop: 20, marginBottom: 20
          }} delay={100} />
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.4 }}
          style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)', maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.6 }}>
          Join thousands of creators mastering ComfyUI. No fluff. No shortcuts. Just the real curriculum.
        </motion.p>
        <FooterBar setPage={setPage} />
      </div>
    </section>
  );
}

/* ── Home Page ── */
function HomePage({ setPage }) {
  return (
    <div>
      <Hero setPage={setPage} />
      <div>
        <FeatureHeroSection setPage={setPage} />
        <CourseShowcaseSection setPage={setPage} />
        <WhyChooseSection />
        <CtaBannerSection setPage={setPage} />
        <TestimonialsSection />
        <FAQSection />
        <CtaFooter setPage={setPage} />
      </div>
    </div>
  );
}

Object.assign(window, { HomePage });
