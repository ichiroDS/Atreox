
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
function PackagesPage({ setPage }) {
  const [openFaq, setOpenFaq] = useState(null);
  const SENA = '/public/showcase/sena/';

  const tiersRef = useRef(null);
  const tiersInView = useInView(tiersRef, { once: true, amount: 0.1 });
  const charsRef = useRef(null);
  const charsInView = useInView(charsRef, { once: true, amount: 0.2 });
  const faqRef = useRef(null);
  const faqInView = useInView(faqRef, { once: true, amount: 0.15 });

  const tiers = [
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
      onCta: () => {},
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
      onCta: () => {},
      highlight: true,
      counter: '0 / 5 sold',
    },
    {
      name: 'Exclusive License',
      price: '$899 — $1,499',
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
      onCta: () => setPage('contact'),
      highlight: false,
      counter: null,
    },
  ];

  const faqs = [
    { q: 'What format are the LoRAs?', a: 'Flux .safetensors format, compatible with ComfyUI and other Flux-compatible interfaces.' },
    { q: 'Can I use these for NSFW?', a: 'Yes. All packages include SFW-ready assets. NSFW anatomy LoRA is available as an add-on with Exclusive packages, or separately.' },
    { q: "What's your refund policy?", a: 'Due to the digital nature of LoRA files, all sales are final. We offer full support to make sure you get results.' },
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
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.55)', maxWidth: 520, margin: '0 auto 12px', lineHeight: 1.65 }}>
          Production-ready AI influencer characters. Trained, tested, and ready to deploy.
        </p>
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.88rem', color: 'rgba(255,255,255,0.35)', maxWidth: 560, margin: '0 auto', lineHeight: 1.65 }}>
          Every package includes a Flux LoRA fine-tune, starter photo set, prompting guide, and commercial license. Pick your exclusivity level.
        </p>
      </section>

      {/* ── License Tiers ── */}
      <section ref={tiersRef} className="section-block" style={{ padding: '80px 5%', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, alignItems: 'start' }}>
          {tiers.map((tier, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={tiersInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className={tier.highlight ? 'liquid-glass-strong glass-card-interactive' : 'liquid-glass glass-card-interactive'}
              style={{
                borderRadius: 24, padding: '44px 30px', position: 'relative',
                border: tier.highlight ? `1px solid ${tier.accentColor}55` : '1px solid rgba(255,255,255,0.07)',
              }}>
              {/* Top gradient line */}
              <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: `linear-gradient(90deg, transparent, ${tier.accentColor}66, transparent)` }} />

              {/* Badge */}
              <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: tier.highlight ? `linear-gradient(135deg, ${tier.accentColor}, #6d28d9)` : 'rgba(255,255,255,0.1)', border: tier.highlight ? 'none' : '1px solid rgba(255,255,255,0.15)', borderRadius: 9999, padding: '4px 16px', whiteSpace: 'nowrap' }}>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.68rem', color: 'white', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{tier.badge}</span>
              </div>

              <h3 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14, marginTop: 8 }}>{tier.name}</h3>
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', color: 'white', lineHeight: 1 }}>{tier.price}</span>
              </div>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.84rem', color: 'rgba(255,255,255,0.5)', marginBottom: 20, lineHeight: 1.6 }}>{tier.desc}</p>

              {tier.counter && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${tier.accentColor}18`, border: `1px solid ${tier.accentColor}33`, borderRadius: 9999, padding: '5px 14px', marginBottom: 20 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: tier.accentColor, opacity: 0.85 }} />
                  <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.78rem', color: tier.accentColor }}>{tier.counter}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {tier.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <Check size={13} color={tier.accentColor} style={{ marginTop: 3, flexShrink: 0 }} />
                    <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.83rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>

              {tier.highlight ? (
                <button className="btn-gradient" onClick={tier.onCta} style={{ width: '100%', borderRadius: 14, padding: '14px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.93rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {tier.cta} <ArrowUpRight size={15} />
                </button>
              ) : (
                <button className="liquid-glass btn-glass-hover" onClick={tier.onCta} style={{ width: '100%', borderRadius: 14, padding: '14px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(255,255,255,0.07)' }}>
                  {tier.cta} <ArrowUpRight size={15} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Available Characters ── */}
      <section ref={charsRef} className="section-block" style={{ padding: '80px 5%', maxWidth: 1280, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={charsInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.65 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <SectionBadge>Characters</SectionBadge>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'white', letterSpacing: '-0.03em', lineHeight: 1.05, marginTop: 14 }}>
              Available Characters
            </h2>
          </div>

          <div className="liquid-glass" style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch' }}>
              <div style={{ flex: '0 0 280px', minWidth: 220, position: 'relative' }}>
                <img src={SENA + 'hero-1.jpg'} alt="Character #1" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 300 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 60%, rgba(0,0,0,0.45))' }} />
              </div>
              <div style={{ flex: '1 1 260px', padding: '40px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.22)', borderRadius: 9999, padding: '4px 14px', marginBottom: 18, alignSelf: 'flex-start' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171', animation: 'pulse-dot 2s ease-in-out infinite' }} />
                  <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.7rem', color: '#f87171', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Coming Soon</span>
                </div>
                <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', color: 'white', lineHeight: 1.05, marginBottom: 12, letterSpacing: '-0.02em' }}>
                  Character #1
                </h3>
                <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: 28, maxWidth: 380 }}>
                  First character drops this week. Join the waitlist to be first in line and get early-access pricing.
                </p>
                <button className="btn-gradient" onClick={() => setPage('contact')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 9999, padding: '13px 28px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', alignSelf: 'flex-start' }}>
                  Join the Waitlist <ArrowUpRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Custom Character ── */}
      <section className="section-block" style={{ padding: '80px 5%', maxWidth: 1280, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="liquid-glass" style={{ borderRadius: 24, padding: '64px 5%', textAlign: 'center', border: '1px solid rgba(255,255,255,0.07)' }}>
          <SectionBadge>Custom</SectionBadge>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'white', letterSpacing: '-0.03em', lineHeight: 1.05, marginTop: 16, marginBottom: 14 }}>
            Need something unique?
          </h2>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.65 }}>
            We build custom AI characters from scratch — your concept, your face, your brand. Flux LoRA + WAN video + full prompt engineering. Starting at $500.
          </p>
          <button className="btn-gradient" onClick={() => setPage('contact')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 9999, padding: '14px 32px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}>
            Get a Quote <ArrowUpRight size={15} />
          </button>
        </div>
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
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '18px 22px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.9rem', color: 'white', textAlign: 'left', lineHeight: 1.4 }}>{q}</span>
                <div style={{ transition: 'transform 0.25s ease', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
                  <ChevronDown size={16} color="rgba(255,255,255,0.4)" />
                </div>
              </button>
              {openFaq === i && (
                <div className="faq-answer" style={{ padding: '0 22px 18px' }}>
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
    </div>
  );
}

Object.assign(window, { CoursesPage, CheckoutPage, ResourcesPage, ContactPage, PackagesPage });
