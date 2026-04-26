
const React = window.React;
const { useState, useEffect, useRef } = React;
const {
  motion, useInView,
  ArrowUpRight, Check, ChevronDown, Clock, BookOpen, Play,
  Sparkles, Zap, Globe, Brain, Layers, CreditCard, Lock, X,
  SectionBadge, SectionHeading, GlassBtn, FooterBar, BlurText,
  PageHero, PageSection, FieldWrap,
} = window;

/* ── Countdown Timer ── */
const OFFER_KEY = 'atreox_offer_end_v1';
function getOfferEnd() {
  let end = parseInt(localStorage.getItem(OFFER_KEY) || '0');
  if (!end || end < Date.now()) {
    end = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(OFFER_KEY, end.toString());
  }
  return end;
}
function useCountdown() {
  const [ms, setMs] = useState(() => Math.max(0, getOfferEnd() - Date.now()));
  useEffect(() => {
    const id = setInterval(() => setMs(Math.max(0, getOfferEnd() - Date.now())), 1000);
    return () => clearInterval(id);
  }, []);
  const p = n => String(n).padStart(2, '0');
  return {
    h: p(Math.floor(ms / 3600000)),
    m: p(Math.floor((ms % 3600000) / 60000)),
    s: p(Math.floor((ms % 60000) / 1000)),
  };
}

/* ══════════════════════════════════════
   COURSES PAGE
══════════════════════════════════════ */
function CoursesPage({ setPage, user, onLoginClick }) {
  const { h, m, s } = useCountdown();
  const hasPurchased = (() => {
    try { return !!JSON.parse(localStorage.getItem('atreox_course_access') || 'null')?.sessionId; } catch { return false; }
  })();

  const features = [
    'FLUX.1 & SDXL photoreal generation',
    'WAN Video for AI video creation',
    'Full ComfyUI node-based workflows',
    '4 new lessons added every month',
    'Build your own AI influencer',
    'Downloadable workflow files',
    'Community Discord access',
    'Lifetime course updates',
  ];

  const TimerBlock = ({ val, label }) => (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div className="liquid-glass" style={{ borderRadius: 10, padding: '10px 6px', marginBottom: 5 }}>
        <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '2rem', color: 'white', lineHeight: 1, display: 'block' }}>{val}</span>
      </div>
      <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
    </div>
  );

  const handleGetAccess = () => {
    if (hasPurchased) {
      window.location.href = '/course';
    } else if (!user) {
      onLoginClick();
    } else {
      setPage('checkout');
    }
  };

  return (
    <div>
      <PageHero
        badge="Courses"
        title="Create your AI Influencer."
        sub="The complete blueprint for building photoreal AI influencers using the most powerful ComfyUI workflows available."
      />

      {/* Course Layout */}
      <PageSection>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>

          {/* Main Course Card */}
          <div className="liquid-glass-strong" style={{
            flex: '1 1 500px', borderRadius: 28, padding: '44px 40px',
            border: '1px solid rgba(255,255,255,0.13)', position: 'relative', overflow: 'hidden',
          }}>
            {/* SALE badge */}
            <div style={{ position: 'absolute', top: 24, right: 24, background: 'linear-gradient(135deg, #f87171, #fb923c)', borderRadius: 9999, padding: '4px 14px' }}>
              <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: '0.68rem', color: 'white', letterSpacing: '0.08em', textTransform: 'uppercase' }}>SALE</span>
            </div>

            <div style={{ marginBottom: 18 }}>
              <span style={{ background: 'rgba(79,142,247,0.14)', borderRadius: 9999, padding: '4px 14px', fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.7rem', color: '#4f8ef7', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Blueprint Course</span>
            </div>

            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(1.5rem, 2.8vw, 2.2rem)', color: 'white', lineHeight: 1.12, marginBottom: 20, letterSpacing: '-0.02em' }}>
              Photoreal Influencer Blueprint:<br />Flux — SDXL — WAN Video (ComfyUI)
            </h2>

            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.93rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.72, marginBottom: 30 }}>
              Everything you need to create your own AI influencer — from photorealistic image generation to full AI video production. Lessons are live <strong style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>right now</strong>, and{' '}
              <strong style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>4 new lessons are added every month</strong> to keep you at the cutting edge of generative AI.
            </p>

            {/* Features grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 28px', marginBottom: 36 }}>
              {features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                  <Check size={13} color="#34d399" style={{ marginTop: 3, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.82rem', color: 'rgba(255,255,255,0.68)', lineHeight: 1.45 }}>{f}</span>
                </div>
              ))}
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '3.2rem', color: 'white', lineHeight: 1 }}>$89</span>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)' }}>/month</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '1.25rem', color: 'rgba(255,255,255,0.28)', textDecoration: 'line-through' }}>$149</span>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.75rem', color: 'rgba(255,255,255,0.28)' }}>/month regular</span>
              </div>
            </div>

            {/* CTA */}
            <button
              className="btn-white-glow"
              onClick={handleGetAccess}
              style={{
                width: '100%', padding: '16px', borderRadius: 14, border: 'none',
                background: 'white', color: 'black',
                fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '1rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {hasPurchased ? 'Continue Learning' : user ? 'Proceed to Checkout' : 'Get Access Now'} <ArrowUpRight size={16} />
            </button>

            {!user && (
              <p style={{ textAlign: 'center', marginTop: 10, fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.73rem', color: 'rgba(255,255,255,0.3)' }}>
                Login or create an account to purchase
              </p>
            )}
            <p style={{ textAlign: 'center', marginTop: user ? 12 : 6, fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.73rem', color: 'rgba(255,255,255,0.3)' }}>
              Cancel anytime · Instant access · 4 new lessons / month
            </p>
          </div>

          {/* Sidebar — timer only (no top banner) */}
          <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Timer card */}
            <div className="liquid-glass" style={{ borderRadius: 20, padding: '24px', border: '1px solid rgba(248,113,113,0.18)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Clock size={15} color="#f87171" />
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.82rem', color: '#f87171' }}>Offer expires in</span>
              </div>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>
                Save 40% — limited time discount
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <TimerBlock val={h} label="Hours" />
                <TimerBlock val={m} label="Minutes" />
                <TimerBlock val={s} label="Seconds" />
              </div>
            </div>

            {/* What's included */}
            <div className="liquid-glass" style={{ borderRadius: 20, padding: '24px' }}>
              <h4 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.85rem', color: 'white', marginBottom: 16 }}>What's included</h4>
              {[
                { icon: Play,     text: 'FLUX.1 & SDXL workflows' },
                { icon: Layers,   text: 'WAN Video generation' },
                { icon: Zap,      text: '4 new lessons / month' },
                { icon: Globe,    text: 'Community Discord' },
                { icon: BookOpen, text: 'All workflow files' },
                { icon: Brain,    text: 'AI influencer blueprint' },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
                  <Icon size={13} color="rgba(255,255,255,0.4)" style={{ flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.82rem', color: 'rgba(255,255,255,0.62)' }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="liquid-glass" style={{ borderRadius: 20, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: 30, height: 30, borderRadius: '50%', background: `rgba(255,255,255,${0.06+i*0.03})`, border: '1.5px solid rgba(255,255,255,0.14)', marginLeft: i > 0 ? -9 : 0, flexShrink: 0 }} />
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', gap: 2, marginBottom: 3 }}>
                  {[...Array(5)].map((_, j) => <span key={j} style={{ fontSize: '0.62rem', color: 'white', opacity: 0.8 }}>★</span>)}
                </div>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>12,000+ students enrolled</span>
              </div>
            </div>

            {/* Login nudge if not logged in */}
            {!user && (
              <div className="liquid-glass" style={{ borderRadius: 20, padding: '18px 20px', border: '1px solid rgba(79,142,247,0.18)' }}>
                <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 12 }}>
                  Already have an account?
                </p>
                <button className="btn-glass-hover liquid-glass" onClick={onLoginClick} style={{ width: '100%', borderRadius: 10, padding: '10px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.82rem', cursor: 'pointer', background: 'rgba(79,142,247,0.14)' }}>
                  Login to Purchase
                </button>
              </div>
            )}
          </div>
        </div>
      </PageSection>

      <div style={{ padding: '0 5% 64px' }}><FooterBar setPage={setPage} /></div>
    </div>
  );
}

/* ══════════════════════════════════════
   CHECKOUT PAGE
══════════════════════════════════════ */
function CheckoutPage({ setPage, user }) {
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [promoInput, setPromoInput]   = useState('');
  const [promoStatus, setPromoStatus] = useState('idle'); // idle | loading | valid | invalid
  const [promoData, setPromoData]     = useState(null);   // { promoCodeId, coupon }
  const [promoError, setPromoError]   = useState('');

  const BASE_CENTS = 8900;

  const discountCents = promoData?.coupon
    ? promoData.coupon.percentOff != null
      ? Math.round(BASE_CENTS * promoData.coupon.percentOff / 100)
      : (promoData.coupon.amountOff || 0)
    : 0;

  const finalCents = Math.max(0, BASE_CENTS - discountCents);

  const fmtUSD = cents => '$' + (cents / 100).toFixed(2).replace(/\.00$/, '');

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoStatus('loading');
    setPromoError('');
    setPromoData(null);
    try {
      const res  = await fetch('/api/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput }),
      });
      const data = await res.json();
      if (data.valid) {
        setPromoData({ promoCodeId: data.promoCodeId, coupon: data.coupon });
        setPromoStatus('valid');
      } else {
        setPromoError(data.error || 'Invalid discount code.');
        setPromoStatus('invalid');
      }
    } catch {
      setPromoError('Could not validate code. Please try again.');
      setPromoStatus('invalid');
    }
  };

  const handleRemovePromo = () => {
    setPromoData(null);
    setPromoInput('');
    setPromoStatus('idle');
    setPromoError('');
  };

  const handlePay = async () => {
    setError('');
    setLoading(true);
    try {
      const res  = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, name: user?.name, promoCodeId: promoData?.promoCodeId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Could not start checkout. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: 100, paddingBottom: 80, padding: '100px 5% 80px', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ marginBottom: 40 }}>
        <button onClick={() => setPage('courses')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, padding: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to Courses
        </button>
        <SectionBadge>Secure Checkout</SectionBadge>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'white', marginTop: 16, letterSpacing: '-0.02em' }}>
          Complete your purchase
        </h1>
      </motion.div>

      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* Payment panel — Stripe redirect */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="liquid-glass-strong" style={{ flex: '1 1 440px', borderRadius: 28, padding: '40px 36px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 28 }}>Payment</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Account info */}
            <div className="liquid-glass" style={{ borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#4f8ef7,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.82rem', color: 'white' }}>{user?.name?.[0]?.toUpperCase()}</span>
              </div>
              <div>
                <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.85rem', color: 'white' }}>{user?.name}</p>
                <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{user?.email}</p>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399' }} />
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>Verified</span>
              </div>
            </div>

            {/* Stripe info block */}
            <div className="liquid-glass" style={{ borderRadius: 14, padding: '20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#635BFF"/><path d="M13.4 12.6c0-.7.6-1 1.5-1 1.3 0 3 .4 4.3 1.1V9.4c-1.4-.6-2.9-.8-4.3-.8-3.5 0-5.9 1.8-5.9 4.9 0 4.7 6.5 4 6.5 6 0 .8-.7 1.1-1.7 1.1-1.5 0-3.4-.6-4.8-1.5v3.4c1.6.7 3.2 1 4.8 1 3.6 0 6.1-1.8 6.1-4.9 0-5.1-6.5-4.2-6.5-6z" fill="white"/></svg>
              <div>
                <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.88rem', color: 'white', marginBottom: 2 }}>Pay securely with Stripe</p>
                <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>Card, Apple Pay, Google Pay and more</p>
              </div>
            </div>

            {/* Promo code */}
            {promoStatus === 'valid' && promoData ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 12, padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.83rem', color: '#34d399' }}>{promoData.coupon.name}</span>
                  <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.78rem', color: 'rgba(52,211,153,0.7)' }}>
                    {promoData.coupon.percentOff != null ? `−${promoData.coupon.percentOff}%` : `−${fmtUSD(promoData.coupon.amountOff)}`} applied
                  </span>
                </div>
                <button onClick={handleRemovePromo} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: '0 2px' }}>×</button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div className="liquid-glass glass-field" style={{ flex: 1, borderRadius: 10, padding: '11px 14px' }}>
                    <input
                      value={promoInput}
                      onChange={e => { setPromoInput(e.target.value); setPromoError(''); setPromoStatus('idle'); }}
                      onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                      placeholder="Discount code"
                      style={{ background: 'none', border: 'none', outline: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', width: '100%', letterSpacing: '0.04em' }}
                    />
                  </div>
                  <button
                    onClick={handleApplyPromo}
                    disabled={promoStatus === 'loading' || !promoInput.trim()}
                    className="btn-glass-hover"
                    style={{ borderRadius: 10, padding: '11px 18px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.83rem', cursor: promoStatus === 'loading' || !promoInput.trim() ? 'default' : 'pointer', opacity: !promoInput.trim() ? 0.45 : 1, whiteSpace: 'nowrap' }}
                  >
                    {promoStatus === 'loading' ? '…' : 'Apply'}
                  </button>
                </div>
                {promoError && (
                  <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.76rem', color: '#f87171', marginTop: 6, paddingLeft: 2 }}>{promoError}</p>
                )}
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.28)', borderRadius: 10, padding: '10px 14px' }}>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: '#f87171' }}>{error}</span>
              </div>
            )}

            <button className="btn-gradient" onClick={handlePay} disabled={loading} style={{
              borderRadius: 14, padding: '16px', border: 'none', color: 'white',
              fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: '1rem',
              cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8,
            }}>
              {loading
                ? <><svg style={{ animation: 'spin 0.8s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Redirecting to Stripe…</>
                : <><Lock size={15} /> Pay {fmtUSD(finalCents)} / month</>
              }
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Lock size={12} color="rgba(255,255,255,0.3)" />
              <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.73rem', color: 'rgba(255,255,255,0.3)' }}>256-bit SSL encryption · Powered by Stripe</span>
            </div>
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
          style={{ flex: '0 1 320px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div className="liquid-glass" style={{ borderRadius: 24, padding: '28px' }}>
            <h3 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>Order Summary</h3>

            <div className="liquid-glass" style={{ borderRadius: 14, padding: '16px', marginBottom: 20, display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: 'linear-gradient(135deg, rgba(79,142,247,0.2), rgba(167,139,250,0.2))', border: '1px solid rgba(79,142,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
                  <polygon points="18,7 29,14 29,26 18,29 7,22 7,10" fill="none" stroke="white" strokeWidth="1.5" opacity="0.7"/>
                  <circle cx="18" cy="18" r="3" fill="white" opacity="0.7"/>
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.85rem', color: 'white', marginBottom: 3 }}>Photoreal Influencer Blueprint</p>
                <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Flux · SDXL · WAN Video · ComfyUI</p>
              </div>
            </div>

            {[
              { label: 'Subtotal', val: '$149.00' },
              { label: 'Discount (40%)', val: '−$60.00', accent: '#34d399' },
            ].map(({ label, val, accent }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{label}</span>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.85rem', color: accent || 'rgba(255,255,255,0.7)' }}>{val}</span>
              </div>
            ))}

            {promoStatus === 'valid' && promoData && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                  Code: {promoData.coupon.name}
                </span>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.85rem', color: '#34d399' }}>
                  −{fmtUSD(discountCents)}
                </span>
              </div>
            )}

            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '16px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.95rem', color: 'white' }}>Total today</span>
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.5rem', color: 'white', lineHeight: 1 }}>{fmtUSD(finalCents)}</span>
            </div>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.73rem', color: 'rgba(255,255,255,0.3)' }}>then $149/month · cancel anytime</p>
          </div>

          {/* Trust badges */}
          <div className="liquid-glass" style={{ borderRadius: 18, padding: '18px 20px' }}>
            {[
              { icon: '🔒', text: 'Secure 256-bit SSL checkout' },
              { icon: '↩', text: '30-day money-back guarantee' },
              { icon: '⚡', text: 'Instant access after payment' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, ':last-child': { marginBottom: 0 } }}>
                <span style={{ fontSize: '0.85rem' }}>{icon}</span>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   RESOURCES PAGE
══════════════════════════════════════ */
function ResourcesPage({ setPage }) {
  const [activeFolder, setActiveFolder] = useState(0);
  const folders = [
    { name: 'FLUX Flexgram', models: [{ type: 'MODEL', name: 'Flux.1 Dev FP8' },{ type: 'CLIP', name: 'Text Encoders' },{ type: 'VAE', name: 'Flux1 VAE' },{ type: 'LORA', name: 'Fluxgram LoRA' }], workflow: { name: 'ComfyUI Workflow', desc: 'Download the ComfyUI workflow file' } },
    { name: 'FLUX Luxury LifeStyle', models: [{ type: 'MODEL', name: 'Flux.1 Dev FP8' },{ type: 'CLIP', name: 'Text Encoders' },{ type: 'VAE', name: 'Flux1 VAE' },{ type: 'LORA', name: 'Luxury Style LoRA' }], workflow: { name: 'ComfyUI Workflow', desc: 'Download the ComfyUI workflow file' } },
    { name: 'SDXL Analog Madness', models: [{ type: 'MODEL', name: 'SDXL Base 1.0' },{ type: 'VAE', name: 'SDXL VAE fp16' },{ type: 'LORA', name: 'Analog Madness LoRA' }], workflow: { name: 'ComfyUI Workflow', desc: 'Download the ComfyUI workflow file' } },
  ];
  const typeColor = { MODEL: '#4f8ef7', CLIP: '#a78bfa', VAE: '#34d399', LORA: '#f59e0b' };
  const current = folders[activeFolder];
  const FolderIcon = ({ active }) => (<svg width="14" height="14" viewBox="0 0 24 24" fill={active ? 'rgba(255,255,255,0.25)' : 'none'} stroke="currentColor" strokeWidth="1.75"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>);
  const DownloadIcon = () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>);
  return (
    <div>
      <PageHero badge="Resources" title="Models & Workflows." sub="Download the exact AI models and ComfyUI workflows used in every course. Everything you need, in one place." />
      <PageSection>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div className="liquid-glass-strong" style={{ width: 220, flexShrink: 0, borderRadius: 20, padding: '20px 12px', minWidth: 175, position: 'sticky', top: 88 }}>
            <h4 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, paddingLeft: 10 }}>Folders</h4>
            {folders.map((folder, i) => (
              <button key={i} onClick={() => setActiveFolder(i)} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: 'none', background: activeFolder === i ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeFolder === i ? 'white' : 'rgba(255,255,255,0.5)', fontFamily: 'Barlow, sans-serif', fontWeight: activeFolder === i ? 500 : 300, fontSize: '0.83rem', cursor: 'pointer', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 9, transition: 'all 0.2s' }}>
                <FolderIcon active={activeFolder === i} />{folder.name}
              </button>
            ))}
          </div>
          <div style={{ flex: '1 1 400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
              <h3 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.95rem', color: 'white' }}>AI Models for <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' }}>"{current.name}"</span></h3>
              <div className="liquid-glass" style={{ borderRadius: 9999, padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(79,142,247,0.12)', cursor: 'default' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4f8ef7', animation: 'pulse-dot 2s ease-in-out infinite' }} />
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.73rem', color: '#4f8ef7' }}>Original Model</span>
              </div>
            </div>
            <div className="liquid-glass" style={{ borderRadius: 20, padding: '24px', marginBottom: 16 }}>
              <h4 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.75rem', color: 'rgba(255,255,255,0.38)', marginBottom: 18, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Models Used</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 12 }}>
                {current.models.map((model, i) => (
                  <div key={i} className="liquid-glass-strong" style={{ borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 10, flexShrink: 0, background: `${typeColor[model.type]}14`, border: `1px solid ${typeColor[model.type]}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: '0.58rem', color: typeColor[model.type], letterSpacing: '0.06em' }}>{model.type}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.82rem', color: 'white', marginBottom: 9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{model.name}</p>
                      <button className="btn-glass-hover" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 10px', color: 'rgba(255,255,255,0.65)', fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <DownloadIcon /> Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="liquid-glass" style={{ borderRadius: 20, padding: '24px' }}>
              <h4 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.75rem', color: 'rgba(255,255,255,0.38)', marginBottom: 18, letterSpacing: '0.04em', textTransform: 'uppercase' }}>ComfyUI Workflow</h4>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                <div>
                  <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.9rem', color: '#4f8ef7', marginBottom: 5 }}>{current.workflow.name}</p>
                  <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: 'rgba(255,255,255,0.38)' }}>Download the <span style={{ color: '#4f8ef7', cursor: 'pointer' }}>ComfyUI workflow file</span></p>
                </div>
                <button className="btn-white-glow" style={{ background: 'white', color: 'black', border: 'none', borderRadius: 10, padding: '11px 20px', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                  <DownloadIcon /> Download Workflow
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageSection>
      <div style={{ padding: '0 5% 64px' }}><FooterBar setPage={setPage} /></div>
    </div>
  );
}

/* ══════════════════════════════════════
   CONTACT PAGE
══════════════════════════════════════ */
function ContactPage({ setPage }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const { Check, ArrowUpRight, Clock } = window;
  const inputStyle = { background: 'none', border: 'none', outline: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', width: '100%' };
  const labelStyle = { fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.76rem', color: 'rgba(255,255,255,0.45)', marginBottom: 6, display: 'block' };
  const workingHours = [{ day: 'Monday — Friday', hours: '9:00 AM — 6:00 PM UTC', open: true },{ day: 'Saturday', hours: '10:00 AM — 2:00 PM UTC', open: true },{ day: 'Sunday', hours: 'Closed', open: false }];
  return (
    <div>
      <PageHero badge="Contact" title="Let's talk." sub="Have a question about a course, workflow, or subscription? We're here to help." />
      <PageSection>
        <div style={{ display: 'flex', gap: 36, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div className="liquid-glass-strong" style={{ flex: '1 1 360px', borderRadius: 24, padding: '40px 36px' }}>
            <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.9rem', color: 'white', marginBottom: 6 }}>Send a message</h3>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.84rem', color: 'rgba(255,255,255,0.42)', marginBottom: 28, lineHeight: 1.6 }}>Or email <a href="mailto:hello@atreoxai.com" style={{ color: '#4f8ef7', textDecoration: 'none' }}>hello@atreoxai.com</a></p>
            {!sent ? (
              <form onSubmit={e => { e.preventDefault(); setSent(true); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div><label style={labelStyle}>Name</label><FieldWrap><input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inputStyle} /></FieldWrap></div>
                <div><label style={labelStyle}>Email</label><FieldWrap><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={inputStyle} /></FieldWrap></div>
                <div><label style={labelStyle}>Message</label><FieldWrap><textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="How can we help?" rows={5} style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} /></FieldWrap></div>
                <button type="submit" className="btn-white-glow" style={{ background: 'white', color: 'black', border: 'none', borderRadius: 10, padding: '14px', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
                  Send Message <ArrowUpRight size={15} />
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }} style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                  <Check size={22} color="#34d399" />
                </motion.div>
                <h4 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.5rem', color: 'white', marginBottom: 8 }}>Message sent!</h4>
                <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.42)' }}>We'll get back to you within 24 hours.</p>
              </div>
            )}
          </div>
          <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="liquid-glass" style={{ borderRadius: 20, padding: '26px 24px' }}>
              <h4 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.88rem', color: 'white', marginBottom: 6 }}>Email us directly</h4>
              <a href="mailto:hello@atreoxai.com" style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.84rem', color: '#4f8ef7', textDecoration: 'none', display: 'block', marginBottom: 8 }}>hello@atreoxai.com</a>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.76rem', color: 'rgba(255,255,255,0.3)' }}>Typical response within 24 hours</p>
            </div>
            <div className="liquid-glass" style={{ borderRadius: 20, padding: '26px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <Clock size={15} color="rgba(255,255,255,0.5)" />
                <h4 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.88rem', color: 'white' }}>Working Hours</h4>
              </div>
              {workingHours.map(({ day, hours, open }, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < workingHours.length-1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.82rem', color: 'rgba(255,255,255,0.58)' }}>{day}</span>
                  <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.82rem', color: open ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.28)' }}>{hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageSection>
      <div style={{ padding: '0 5% 64px' }}><FooterBar setPage={setPage} /></div>
    </div>
  );
}

/* ══════════════════════════════════════
   PACKAGES PAGE
══════════════════════════════════════ */

/* License tier data — shared between PackagesPage and the tier modal */
const LICENSE_TIERS = [
  {
    name: 'Open License',
    price: '$99',
    badge: 'Most Popular',
    accentColor: '#4f8ef7',
    desc: 'Unlimited buyers. Same character, no restrictions on who else can use it.',
    features: [
      'Flux LoRA fine-tune (.safetensors)',
      '30+ starter images',
      'Prompt guide + recommended workflows',
      'Commercial use license (non-exclusive)',
      'Discord community access',
    ],
    cta: 'Buy Now — $99',
    highlight: false,
    counter: null,
  },
  {
    name: 'Limited License',
    price: '$249',
    badge: 'Best Value',
    accentColor: '#a78bfa',
    desc: 'Max 5 buyers per character. Public counter shows remaining slots.',
    features: [
      'Everything in Open License',
      'Limited to 5 total copies',
      'Priority support',
      'WAN video LoRA included',
    ],
    cta: 'Buy Now — $249',
    highlight: true,
    counter: '0 / 5 sold',
  },
  {
    name: 'Exclusive License',
    price: '$899 – $1,499',
    badge: 'One Owner',
    accentColor: '#f59e0b',
    desc: 'Sold once, forever. You are the only person who will ever own this character.',
    features: [
      'Everything in Limited License',
      'Sold exactly once — permanently removed after purchase',
      'Full character ownership',
      'Custom prompt pack tailored to your niche',
      'NSFW anatomy LoRA add-on available',
      '1-on-1 setup call (30 min)',
    ],
    cta: 'Contact for Exclusive',
    highlight: false,
    counter: null,
    contactOnly: true,
  },
];

/* ── Tier Modal ── */
function TierModal({ character, productType, onClose, onContact }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        className="liquid-glass-strong"
        style={{ borderRadius: 28, padding: 'clamp(24px,4vw,44px)', width: '100%', maxWidth: 820, maxHeight: '90vh', overflowY: 'auto', position: 'relative', background: 'rgba(8,8,16,0.97)' }}>
        <button onClick={onClose} className="btn-glass-hover" style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.07)', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <X size={14} color="rgba(255,255,255,0.55)" />
        </button>

        <div style={{ marginBottom: 28 }}>
          <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
            {character} · {productType}
          </span>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: 'white', letterSpacing: '-0.02em', marginTop: 6, lineHeight: 1 }}>
            Choose your license
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, alignItems: 'start' }}>
          {LICENSE_TIERS.map((tier, i) => (
            <div key={i}
              className={tier.highlight ? 'liquid-glass-strong' : 'liquid-glass'}
              style={{ borderRadius: 20, padding: '28px 22px', position: 'relative', border: tier.highlight ? `1px solid ${tier.accentColor}55` : '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: `linear-gradient(90deg, transparent, ${tier.accentColor}66, transparent)` }} />
              {tier.highlight && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: `linear-gradient(135deg, ${tier.accentColor}, #6d28d9)`, borderRadius: 9999, padding: '3px 14px', whiteSpace: 'nowrap' }}>
                  <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.65rem', color: 'white', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{tier.badge}</span>
                </div>
              )}
              <h3 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10, marginTop: tier.highlight ? 8 : 0 }}>{tier.name}</h3>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', color: 'white', lineHeight: 1, wordBreak: 'break-word' }}>{tier.price}</span>
              </div>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 16, lineHeight: 1.6 }}>{tier.desc}</p>
              {tier.counter && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: `${tier.accentColor}18`, border: `1px solid ${tier.accentColor}33`, borderRadius: 9999, padding: '4px 12px', marginBottom: 14 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: tier.accentColor }} />
                  <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.72rem', color: tier.accentColor }}>{tier.counter}</span>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {tier.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <Check size={12} color={tier.accentColor} style={{ marginTop: 3, flexShrink: 0 }} />
                    <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.78rem', color: 'rgba(255,255,255,0.62)', lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
              {tier.contactOnly ? (
                <button className="liquid-glass btn-glass-hover" onClick={onContact} style={{ width: '100%', borderRadius: 12, padding: '12px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'rgba(255,255,255,0.07)', minHeight: 44 }}>
                  {tier.cta} <ArrowUpRight size={14} />
                </button>
              ) : tier.highlight ? (
                <button className="btn-gradient" onClick={() => {}} style={{ width: '100%', borderRadius: 12, padding: '12px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, minHeight: 44 }}>
                  {tier.cta} <ArrowUpRight size={14} />
                </button>
              ) : (
                <button className="liquid-glass btn-glass-hover" onClick={() => {}} style={{ width: '100%', borderRadius: 12, padding: '12px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'rgba(255,255,255,0.07)', minHeight: 44 }}>
                  {tier.cta} <ArrowUpRight size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ── Product type cards (Level 1) ── */
const PRODUCT_TYPES = [
  { id: 'lora',     label: 'Character LoRA Only',       subtitle: 'Lightweight. Add to any base model.', bestFor: 'Tinkerers who already know ComfyUI', from: '$49',  color: '#4f8ef7' },
  { id: 'model',    label: 'Full Flux Fine-tune Model',  subtitle: 'Standalone .safetensors model. Maximum consistency.', bestFor: 'Serious creators who want pro-grade results', from: '$99',  color: '#34d399' },
  { id: 'wan',      label: 'WAN Video LoRA',             subtitle: 'Animate your character. Talking, walking, posing.', bestFor: 'Creators making video content for TikTok/IG/Fanvue', from: '$149', color: '#a78bfa' },
  { id: 'complete', label: 'Complete Package',           subtitle: 'Flux fine-tune + WAN LoRA + RunPod setup + custom nodes', bestFor: 'Anyone serious about launching an AI influencer', from: '$249', color: '#f59e0b', popular: true },
];

/* ── Character card badges ── */
function TypeBadge({ label, available, color }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: available ? `${color}18` : 'rgba(255,255,255,0.05)', border: `1px solid ${available ? color + '40' : 'rgba(255,255,255,0.1)'}`, borderRadius: 6, padding: '3px 8px' }}>
      <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.65rem', color: available ? color : 'rgba(255,255,255,0.3)', letterSpacing: '0.04em' }}>{label}</span>
      {available && <span style={{ fontSize: '0.6rem', color }}>✓</span>}
    </div>
  );
}

function PackagesPage({ setPage }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [modal, setModal] = useState(null); // { character, productType }
  const SENA = '/public/showcase/sena/';

  const level1Ref = useRef(null);
  const level1InView = useInView(level1Ref, { once: true, amount: 0.1 });
  const charsRef = useRef(null);
  const charsInView = useInView(charsRef, { once: true, amount: 0.1 });
  const faqRef = useRef(null);
  const faqInView = useInView(faqRef, { once: true, amount: 0.15 });

  const characters = [
    {
      name: 'Sena',
      img: SENA + 'hero-1.jpg',
      available: { lora: false, model: false, wan: false, complete: false },
      badge: 'Coming April 30',
      badgeColor: '#f87171',
    },
    {
      name: 'More characters',
      img: null,
      available: { lora: false, model: false, wan: false, complete: false },
      badge: 'Dropping every 2 weeks',
      badgeColor: 'rgba(255,255,255,0.3)',
      placeholder: true,
    },
  ];

  const faqs = [
    { q: 'What format are the files?', a: 'Flux fine-tunes and LoRAs ship as .safetensors files, compatible with ComfyUI, Forge, and any Flux-compatible interface. WAN LoRAs are also .safetensors, loaded with the WAN ComfyUI node.' },
    { q: 'Can I use these for NSFW?', a: 'Yes. All packages include SFW-ready assets. NSFW anatomy LoRA is available as an add-on with Exclusive packages, or separately on request.' },
    { q: "What's your refund policy?", a: 'Due to the digital nature of LoRA and model files, all sales are final. We offer full support to make sure you get results — contact us if you hit any issues.' },
    { q: 'Do I need my own GPU?', a: 'No. All packages include a RunPod-ready setup guide. You can be generating within 30 minutes of purchase using cloud GPUs — no local hardware required.' },
    { q: 'What is the difference between the LoRA and the Full Model?', a: 'The LoRA (~150 MB) adapts on top of a base model you already have. The Full Flux Fine-tune (~12 GB) is a standalone model trained entirely on the character — it produces stronger consistency and better anatomy, but requires more VRAM. Not sure which? Read the How It Works page.' },
  ];

  return (
    <div>
      {/* ── Hero ── */}
      <section style={{ paddingTop: 160, paddingBottom: 80, paddingLeft: '5%', paddingRight: '5%', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <SectionBadge>Characters & LoRAs</SectionBadge>
        <BlurText text="Character Packages" style={{
          fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
          fontSize: 'clamp(2.8rem, 5vw, 4.5rem)', color: 'white',
          lineHeight: 0.9, letterSpacing: '-2px', marginTop: 20, marginBottom: 20,
        }} delay={90} />
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.55)', maxWidth: 520, margin: '0 auto 16px', lineHeight: 1.65 }}>
          Production-ready AI influencer characters. Trained, tested, and ready to deploy.
        </p>
        <button className="liquid-glass btn-glass-hover" onClick={() => setPage('how-it-works')}
          style={{ borderRadius: 9999, padding: '9px 20px', border: 'none', color: 'rgba(255,255,255,0.55)', fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.82rem', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          Not sure what to buy? Read: How It Works <ArrowUpRight size={13} />
        </button>
      </section>

      {/* ── LEVEL 1: Choose what you need ── */}
      <section ref={level1Ref} className="section-block" style={{ padding: '80px 5%', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <SectionBadge>Step 1</SectionBadge>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)', color: 'white', letterSpacing: '-0.03em', lineHeight: 1.05, marginTop: 14 }}>
            Choose what you need
          </h2>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.88rem', color: 'rgba(255,255,255,0.42)', marginTop: 10 }}>
            Pick a product type, then select a character below
          </p>
        </div>

        {/* 4-column product cards */}
        <style>{`
          .pkg-type-grid-wrap { display: grid; grid-template-columns: repeat(4,1fr); gap: 18px; }
          @media(max-width:900px){ .pkg-type-grid-wrap { grid-template-columns: repeat(2,1fr) !important; } }
          @media(max-width:480px){ .pkg-type-grid-wrap { grid-template-columns: 1fr !important; } }
        `}</style>
        <div className="pkg-type-grid-wrap">
          {PRODUCT_TYPES.map((pt, i) => (
            <motion.div key={pt.id}
              initial={{ opacity: 0, y: 30 }} animate={level1InView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.08 }}
              className="liquid-glass glass-card-interactive"
              style={{ borderRadius: 20, padding: '28px 22px', border: pt.popular ? `1px solid ${pt.color}44` : '1px solid rgba(255,255,255,0.07)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
              {pt.popular && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: `linear-gradient(135deg, ${pt.color}, #a78bfa)`, borderRadius: 9999, padding: '3px 14px', whiteSpace: 'nowrap' }}>
                  <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.62rem', color: 'white', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Most Popular</span>
                </div>
              )}
              {/* color top-line */}
              <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: `linear-gradient(90deg, transparent, ${pt.color}55, transparent)` }} />

              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${pt.color}18`, border: `1px solid ${pt.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, marginTop: pt.popular ? 8 : 0 }}>
                <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.1rem', color: pt.color, lineHeight: 1 }}>
                  {pt.id === 'lora' ? 'L' : pt.id === 'model' ? 'M' : pt.id === 'wan' ? 'V' : 'P'}
                </span>
              </div>

              <h3 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: 'white', marginBottom: 8, lineHeight: 1.3 }}>{pt.label}</h3>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 12, flex: 1 }}>{pt.subtitle}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>Best for:</span>
                </div>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.45 }}>{pt.bestFor}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 16 }}>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>from</span>
                <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.5rem', color: pt.color, lineHeight: 1 }}>{pt.from}</span>
              </div>

              <a href="#characters-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 10, padding: '10px 14px', background: `${pt.color}18`, border: `1px solid ${pt.color}30`, color: pt.color, fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'none', minHeight: 44 }}>
                See characters <ArrowUpRight size={13} />
              </a>
            </motion.div>
          ))}
        </div>

      </section>

      {/* ── LEVEL 2: Available Characters ── */}
      <section id="characters-section" ref={charsRef} className="section-block" style={{ padding: '80px 5%', maxWidth: 1280, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={charsInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <SectionBadge>Step 2</SectionBadge>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)', color: 'white', letterSpacing: '-0.03em', lineHeight: 1.05, marginTop: 14 }}>
              Available Characters
            </h2>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.88rem', color: 'rgba(255,255,255,0.42)', marginTop: 10 }}>
              Click "View options" to see all license tiers for a character
            </p>
          </div>

          {/* Character grid — 3 cols desktop, 2 tablet, 1 mobile */}
          <style>{`.char-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}@media(max-width:900px){.char-grid{grid-template-columns:repeat(2,1fr)!important}}@media(max-width:520px){.char-grid{grid-template-columns:1fr!important}}`}</style>
          <div className="char-grid">
            {characters.map((char, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} animate={charsInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="liquid-glass glass-card-interactive"
                style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
                {/* Image area */}
                <div style={{ position: 'relative', aspectRatio: '3/4', background: 'rgba(255,255,255,0.04)' }}>
                  {char.img ? (
                    <img src={char.img} loading="lazy" alt={char.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.06))' }}>
                      <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '3rem', color: 'rgba(255,255,255,0.12)' }}>?</span>
                    </div>
                  )}
                  {/* Status badge */}
                  <div style={{ position: 'absolute', top: 12, left: 12, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', borderRadius: 9999, padding: '4px 12px', border: `1px solid ${char.badgeColor}44` }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: char.badgeColor, animation: 'pulse-dot 2s ease-in-out infinite', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.65rem', color: char.badgeColor, letterSpacing: '0.05em' }}>{char.badge}</span>
                  </div>
                </div>
                {/* Card body */}
                <div style={{ padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                  <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.3rem', color: 'white', lineHeight: 1 }}>{char.name}</h3>
                  {/* Type badges */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <TypeBadge label="LoRA" available={char.available.lora} color="#4f8ef7" />
                    <TypeBadge label="Model" available={char.available.model} color="#34d399" />
                    <TypeBadge label="WAN" available={char.available.wan} color="#a78bfa" />
                    <TypeBadge label="Pack" available={char.available.complete} color="#f59e0b" />
                  </div>
                  {/* CTA */}
                  {char.placeholder ? (
                    <button className="liquid-glass" onClick={() => setPage('contact')} style={{ marginTop: 'auto', borderRadius: 10, padding: '11px', border: 'none', color: 'rgba(255,255,255,0.5)', fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.82rem', cursor: 'pointer', background: 'rgba(255,255,255,0.04)', minHeight: 44 }}>
                      Join waitlist
                    </button>
                  ) : (
                    <button className="btn-gradient" onClick={() => setModal({ character: char.name, productType: 'Complete Package' })} style={{ marginTop: 'auto', borderRadius: 10, padding: '11px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, minHeight: 44 }}>
                      View options <ArrowUpRight size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Custom Character card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={charsInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.2 }}
              className="liquid-glass glass-card-interactive"
              style={{ borderRadius: 20, border: '1px dashed rgba(255,255,255,0.15)', display: 'flex', flexDirection: 'column', minHeight: 300 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 28px', textAlign: 'center', gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>+</span>
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.3rem', color: 'white', marginBottom: 8 }}>Custom Character</h3>
                  <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: 'rgba(255,255,255,0.42)', lineHeight: 1.6, maxWidth: 220 }}>Your concept. Your face. Your brand. Starting at $500.</p>
                </div>
                <button className="liquid-glass btn-glass-hover" onClick={() => setPage('contact')} style={{ borderRadius: 10, padding: '11px 20px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.82rem', cursor: 'pointer', background: 'rgba(255,255,255,0.07)', minHeight: 44 }}>
                  Get a Quote
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Package FAQ ── */}
      <section ref={faqRef} className="section-block" style={{ padding: '80px 5%', maxWidth: 900, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={faqInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 40 }}>
          <SectionBadge>FAQ</SectionBadge>
          <h2 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: 'white', letterSpacing: '-0.03em', marginTop: 14 }}>
            Package FAQ
          </h2>
        </motion.div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqs.map(({ q, a }, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} animate={faqInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.06 }}
              className="liquid-glass" style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '18px 22px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, minHeight: 44 }}>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.9rem', color: 'white', textAlign: 'left', lineHeight: 1.4 }}>{q}</span>
                <div style={{ transition: 'transform 0.25s ease', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
                  <ChevronDown size={16} color="rgba(255,255,255,0.4)" />
                </div>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 22px 18px' }}>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 14 }} />
                  <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.86rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{a}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      <div style={{ padding: '0 5% 64px' }}>
        <FooterBar setPage={setPage} />
      </div>

      {/* ── Tier Modal ── */}
      {modal && (
        <TierModal
          character={modal.character}
          productType={modal.productType}
          onClose={() => setModal(null)}
          onContact={() => { setModal(null); setPage('contact'); }}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   HOW IT WORKS PAGE
══════════════════════════════════════ */
function HowItWorksPage({ setPage }) {
  const s1Ref = useRef(null); const s1InView = useInView(s1Ref, { once: true, amount: 0.15 });
  const s2Ref = useRef(null); const s2InView = useInView(s2Ref, { once: true, amount: 0.15 });
  const s3Ref = useRef(null); const s3InView = useInView(s3Ref, { once: true, amount: 0.15 });
  const s4Ref = useRef(null); const s4InView = useInView(s4Ref, { once: true, amount: 0.1 });
  const s5Ref = useRef(null); const s5InView = useInView(s5Ref, { once: true, amount: 0.15 });
  const s6Ref = useRef(null); const s6InView = useInView(s6Ref, { once: true, amount: 0.2 });

  const bodyText = { fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.62)', lineHeight: 1.78 };
  const h2Style = { fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', color: 'white', letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 24 };
  const mutedNote = { fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.7, fontStyle: 'italic' };

  const decisions = [
    { trigger: 'I just want to test ComfyUI with a character', result: 'LoRA Only', price: '$49', color: '#4f8ef7' },
    { trigger: "I'm making a serious AI influencer for static content", result: 'Flux Fine-tune', price: '$99', color: '#34d399' },
    { trigger: 'I want video content for TikTok / Reels / Fanvue', result: 'WAN Video LoRA', price: '$149', color: '#a78bfa', note: "You'll also need a Flux model" },
    { trigger: 'I want everything to start a real AI influencer business', result: 'Complete Package', price: '$249', color: '#f59e0b', highlight: true },
    { trigger: 'I want to learn how to do all this myself', result: 'Course', price: '$39 founder / $79 normal', color: '#f87171' },
  ];

  const reasons = [
    { num: '01', title: 'Quality control', body: 'Every model is hand-tuned — not auto-generated. I run 500+ test generations per character before releasing. If it doesn\'t look right, it doesn\'t ship.' },
    { num: '02', title: 'Time saved', body: 'Training a single character from scratch takes 35+ hours of compute, dataset curation, and iteration. You get the result without the grind.' },
    { num: '03', title: 'Ongoing support', body: 'Inner Circle Discord, ATREOX-only custom nodes (anti-plastic-skin, anatomy fix), monthly LoRA drops, and real human help — not just a download link.' },
  ];

  return (
    <div>
      {/* Hero */}
      <section style={{ paddingTop: 160, paddingBottom: 80, paddingLeft: '5%', paddingRight: '5%', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', maxWidth: 860, margin: '0 auto' }}>
        <SectionBadge>Education</SectionBadge>
        <BlurText text="How ATREOX works" style={{
          fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
          fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)', color: 'white',
          lineHeight: 0.92, letterSpacing: '-3px', marginTop: 20, marginBottom: 24,
        }} delay={90} />
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }}
          style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1.05rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
          The honest guide to AI Influencer creation. What we sell, why it costs what it does, and how to choose the right product.
        </motion.p>
      </section>

      {/* Section 1 — What is ComfyUI */}
      <section ref={s1Ref} data-bg-palette="blue-violet" className="section-block" style={{ padding: '80px 5%', maxWidth: 860, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={s1InView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.65 }}>
          <SectionBadge>Section 1</SectionBadge>
          <h2 style={{ ...h2Style, marginTop: 14 }}>What is ComfyUI?</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={bodyText}>ComfyUI is the most powerful AI image and video generation interface available — and it's open-source. Unlike consumer tools like Midjourney or DALL-E, ComfyUI gives you precise, node-by-node control over every step of the generation pipeline. Want to inject a LoRA at a specific denoising step? Control exactly how much of a base model bleeds through? Run custom post-processing after every image? ComfyUI can do it.</p>
            <p style={bodyText}>The trade-off is a steeper learning curve. You work with a visual node graph rather than a simple text box. But the results — especially for consistent AI character creation — are in a different league from any closed platform. Professionals who make real money from AI content use ComfyUI.</p>
            <p style={bodyText}>All ATREOX products are built for ComfyUI. Every package includes a RunPod-ready setup guide and pre-configured workflow files so you can start generating immediately — no prior ComfyUI experience required. The course teaches you the full system from the ground up if you want to go deeper.</p>
          </div>
        </motion.div>
      </section>

      {/* Section 2 — Models vs LoRAs */}
      <section ref={s2Ref} data-bg-palette="teal-violet" className="section-block" style={{ padding: '80px 5%', maxWidth: 1100, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={s2InView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.65 }}>
          <SectionBadge>Section 2</SectionBadge>
          <h2 style={{ ...h2Style, marginTop: 14 }}>Models, LoRAs, and the difference</h2>

          {/* Two-column comparison */}
          <style>{`.compare-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}@media(max-width:600px){.compare-grid{grid-template-columns:1fr!important}}`}</style>
          <div className="compare-grid" style={{ marginBottom: 28 }}>
            {/* Left — Base Model */}
            <div className="liquid-glass" style={{ borderRadius: 20, padding: '32px 28px', border: '1px solid rgba(52,211,153,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1rem', color: '#34d399' }}>M</span>
                </div>
                <h3 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.95rem', color: 'white' }}>Base Model (Flux Fine-tune)</h3>
              </div>
              {[
                'A complete .safetensors file (~12 GB)',
                'Standalone — replaces your base model entirely',
                'Maximum character consistency',
                'Best results for hero shots and brand-quality images',
                'Price: from $99',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 12 }}>
                  <Check size={13} color="#34d399" style={{ marginTop: 3, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.87rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
            {/* Right — LoRA */}
            <div className="liquid-glass" style={{ borderRadius: 20, padding: '32px 28px', border: '1px solid rgba(79,142,247,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1rem', color: '#4f8ef7' }}>L</span>
                </div>
                <h3 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.95rem', color: 'white' }}>LoRA</h3>
              </div>
              {[
                'A lightweight adapter (~150 MB)',
                'Loads on top of your existing base model',
                'Faster to use, but consistency depends on base',
                'Good for experiments and variations',
                'Price: from $49',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 12 }}>
                  <Check size={13} color="#4f8ef7" style={{ marginTop: 3, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.87rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={mutedNote}>A full fine-tune costs more because it requires 10 hours of RunPod training on an 80-photo dataset. A LoRA takes 1–2 hours. Both produce different results — the fine-tune wins on consistency and anatomy accuracy; the LoRA wins on flexibility and file size.</p>
        </motion.div>
      </section>

      {/* Section 3 — WAN Video LoRA */}
      <section ref={s3Ref} data-bg-palette="deep-violet" className="section-block" style={{ padding: '80px 5%', maxWidth: 860, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={s3InView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.65 }}>
          <SectionBadge>Section 3</SectionBadge>
          <h2 style={{ ...h2Style, marginTop: 14 }}>What is a WAN Video LoRA?</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={bodyText}>WAN is the latest open-source video generation model — and for character consistency, it outperforms Sora, Kling, and every other closed platform. Where other video models drift (your character's face changes frame-to-frame), WAN with a character LoRA holds identity across every frame of a clip.</p>
            <p style={bodyText}>A WAN LoRA teaches the video model to render your specific character in motion. Without it, asking WAN to animate "Sena walking" gives you a different person every time. With it, your AI influencer talks, walks, and poses with the same face and body across every clip you generate — usable for TikTok, Instagram Reels, and subscription platform video content.</p>
            <p style={bodyText}>Training a WAN LoRA takes 24 hours of RunPod compute plus dataset curation and iteration. The price reflects that cost, not arbitrary markup. You're buying the output of that work, ready to deploy in under 30 minutes.</p>
            <div className="liquid-glass" style={{ borderRadius: 14, padding: '16px 20px', border: '1px solid rgba(167,139,250,0.2)', marginTop: 4 }}>
              <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.82rem', color: '#a78bfa' }}>WAN Video LoRA — from $149</span>
              <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)' }}> · Requires a Flux base model or fine-tune to use alongside</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Section 4 — Decision Tree */}
      <section ref={s4Ref} data-bg-palette="crimson" className="section-block" style={{ padding: '80px 5%', maxWidth: 860, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={s4InView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.65 }}>
          <SectionBadge>Section 4</SectionBadge>
          <h2 style={{ ...h2Style, marginTop: 14 }}>What should you buy?</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {decisions.map((d, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -20 }} animate={s4InView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.45, delay: i * 0.08 }}
                className={d.highlight ? 'liquid-glass-strong' : 'liquid-glass'}
                style={{ borderRadius: 16, padding: '18px 22px', border: d.highlight ? `1px solid ${d.color}44` : '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', position: 'relative' }}>
                {d.highlight && <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: `linear-gradient(90deg, transparent, ${d.color}55, transparent)` }} />}
                <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                  <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.45 }}>"{d.trigger}"</span>
                  {d.note && <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>Note: {d.note}</p>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>→</span>
                  <div style={{ background: `${d.color}18`, border: `1px solid ${d.color}33`, borderRadius: 8, padding: '6px 12px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.82rem', color: d.color, whiteSpace: 'nowrap' }}>{d.result}</div>
                    <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1rem', color: 'white', lineHeight: 1, marginTop: 2, whiteSpace: 'nowrap' }}>{d.price}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Section 5 — Why ATREOX over Civitai / DIY */}
      <section ref={s5Ref} data-bg-palette="blue-rose" className="section-block" style={{ padding: '80px 5%', maxWidth: 860, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={s5InView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.65 }}>
          <SectionBadge>Section 5</SectionBadge>
          <h2 style={{ ...h2Style, marginTop: 14 }}>Why ATREOX over Civitai or DIY?</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reasons.map(({ num, title, body }, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} animate={s5InView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="liquid-glass"
                style={{ borderRadius: 16, padding: '24px 26px', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.6rem', color: 'rgba(255,255,255,0.15)', lineHeight: 1, flexShrink: 0, minWidth: 36 }}>{num}</div>
                <div>
                  <h4 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.92rem', color: 'white', marginBottom: 8 }}>{title}</h4>
                  <p style={bodyText}>{body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Section 6 — What about the course? */}
      <section ref={s6Ref} data-bg-palette="sky-blue" className="section-block" style={{ padding: '80px 5%', maxWidth: 860, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={s6InView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.65 }}>
          <SectionBadge>Section 6</SectionBadge>
          <h2 style={{ ...h2Style, marginTop: 14 }}>What about the course?</h2>
          <p style={{ ...bodyText, marginBottom: 16 }}>
            The course teaches you the entire pipeline from scratch — ComfyUI setup, Flux training, WAN video generation, prompt engineering, and monetization strategy. If you want to build your own characters and understand every step, the course is the right choice.
          </p>
          <p style={bodyText}>
            If you want a working pipeline <em>today</em>, buy a package. You don't need the course to use ATREOX packages — the setup guide gets you generating in under 30 minutes. Many customers buy both: a package to start immediately, and the course to learn how to build their own.
          </p>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="section-block" style={{ padding: '80px 5%', maxWidth: 860, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="liquid-glass" style={{ borderRadius: 24, padding: 'clamp(40px, 6vw, 72px) clamp(24px, 5%, 60px)', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', color: 'white', letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 14 }}>
            Still not sure? Just ask.
          </h2>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: 32, lineHeight: 1.65 }}>
            I read every message and reply within 24 hours.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-gradient" onClick={() => setPage('packages')}
              style={{ borderRadius: 9999, padding: '14px 32px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', minHeight: 44 }}>
              Browse Packages <ArrowUpRight size={16} />
            </button>
            <button className="liquid-glass btn-glass-hover" onClick={() => setPage('contact')}
              style={{ borderRadius: 9999, padding: '14px 28px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'rgba(255,255,255,0.07)', minHeight: 44 }}>
              Contact me <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
      </section>

      <div style={{ padding: '0 5% 64px' }}><FooterBar setPage={setPage} /></div>
    </div>
  );
}

Object.assign(window, { CoursesPage, CheckoutPage, ResourcesPage, ContactPage, PackagesPage, HowItWorksPage });
