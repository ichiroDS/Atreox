
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
   CHECKOUT PAGE (unified — course + packages)
══════════════════════════════════════ */
function CheckoutPage({ setPage, user }) {
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [promoInput, setPromoInput]   = useState('');
  const [promoStatus, setPromoStatus] = useState('idle');
  const [promoData, setPromoData]     = useState(null);
  const [promoError, setPromoError]   = useState('');

  // Read package cart from localStorage
  const cart = (() => { try { return JSON.parse(localStorage.getItem('atreox_cart_v1') || 'null'); } catch { return null; } })();
  const isPackage = cart?.type === 'package';

  const COURSE_BASE_CENTS = 8900;
  const packageTotalCents = isPackage
    ? (cart.licensePrice + (cart.runpodEnabled ? cart.runpodPrice : 0) + (cart.nsfwEnabled ? cart.nsfwPrice : 0)) * 100
    : 0;
  const BASE_CENTS = isPackage ? packageTotalCents : COURSE_BASE_CENTS;

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
        body: JSON.stringify({ email: user?.email, name: user?.name, promoCodeId: promoData?.promoCodeId, cart: isPackage ? cart : null }),
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
        <button onClick={() => setPage('pricing')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, padding: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to Pricing
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
              width: '100%', borderRadius: 14, padding: '16px', border: 'none', color: 'white',
              fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: '1rem',
              cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8,
            }}>
              {loading
                ? <><svg style={{ animation: 'spin 0.8s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Redirecting to Stripe…</>
                : <><Lock size={15} /> Pay {fmtUSD(finalCents)}{isPackage ? '' : ' / month'}</>
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

            {isPackage ? (
              /* Package order items */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {/* Main product */}
                <div className="liquid-glass" style={{ borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div>
                      <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.85rem', color: 'white', marginBottom: 2 }}>{cart.productLabel} · {cart.character}</p>
                      <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                        {cart.licenseType === 'exclusive' ? 'Exclusive License' : cart.licenseType === 'open' ? 'Open License (50% off)' : (cart.license || '')}
                      </p>
                    </div>
                    <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.9rem', color: 'white', flexShrink: 0 }}>${cart.licensePrice}</span>
                  </div>
                </div>
                {/* RunPod add-on */}
                {cart.runpodEnabled && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>RunPod Setup{cart.runpodPrice === 15 ? ' (discounted)' : ''}</span>
                    <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>+${cart.runpodPrice}</span>
                  </div>
                )}
                {/* NSFW add-on */}
                {cart.nsfwEnabled && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>NSFW Workflow + Anatomy LoRA</span>
                    {cart.nsfwFree
                      ? <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.82rem', color: '#34d399' }}>Included</span>
                      : <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>+${cart.nsfwPrice}</span>
                    }
                  </div>
                )}
              </div>
            ) : (
              /* Course item */
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
            )}

            {/* Subtotal / discount rows */}
            {!isPackage && (
              <>
                {[
                  { label: 'Subtotal', val: '$149.00' },
                  { label: 'Discount (40%)', val: '−$60.00', accent: '#34d399' },
                ].map(({ label, val, accent }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{label}</span>
                    <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.85rem', color: accent || 'rgba(255,255,255,0.7)' }}>{val}</span>
                  </div>
                ))}
              </>
            )}

            {promoStatus === 'valid' && promoData && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Code: {promoData.coupon.name}</span>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.85rem', color: '#34d399' }}>−{fmtUSD(discountCents)}</span>
              </div>
            )}

            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '16px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.95rem', color: 'white' }}>Total{isPackage ? '' : ' today'}</span>
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.5rem', color: 'white', lineHeight: 1 }}>{fmtUSD(finalCents)}</span>
            </div>
            {!isPackage && <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.73rem', color: 'rgba(255,255,255,0.3)' }}>then $149/month · cancel anytime</p>}
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
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

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

      {/* Mobile warning banner */}
      {isMobile && (
        <div style={{ margin: '0 5% 24px', borderRadius: 14, padding: '14px 18px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.82rem', color: 'rgba(248,113,113,0.9)', lineHeight: 1.55, margin: 0 }}>
            Downloads are large. We recommend opening this page on desktop for actual downloads.
          </p>
        </div>
      )}

      <PageSection>
        {/* Mobile: horizontal scrollable tab chips */}
        {isMobile ? (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', display: 'flex', gap: 8, paddingBottom: 16, marginBottom: 24, scrollbarWidth: 'none' }}>
            {folders.map((folder, i) => (
              <button key={i} onClick={() => setActiveFolder(i)} style={{ flexShrink: 0, whiteSpace: 'nowrap', padding: '8px 16px', borderRadius: 9999, border: 'none', background: activeFolder === i ? 'rgba(79,142,247,0.2)' : 'rgba(255,255,255,0.06)', color: activeFolder === i ? '#4f8ef7' : 'rgba(255,255,255,0.5)', fontFamily: 'Barlow, sans-serif', fontWeight: activeFolder === i ? 500 : 300, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s', outline: activeFolder === i ? '1px solid rgba(79,142,247,0.35)' : 'none' }}>
                {folder.name}
              </button>
            ))}
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Desktop sticky sidebar */}
          {!isMobile && (
            <div className="liquid-glass-strong" style={{ width: 220, flexShrink: 0, borderRadius: 20, padding: '20px 12px', minWidth: 175, position: 'sticky', top: 88 }}>
              <h4 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, paddingLeft: 10 }}>Folders</h4>
              {folders.map((folder, i) => (
                <button key={i} onClick={() => setActiveFolder(i)} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: 'none', background: activeFolder === i ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeFolder === i ? 'white' : 'rgba(255,255,255,0.5)', fontFamily: 'Barlow, sans-serif', fontWeight: activeFolder === i ? 500 : 300, fontSize: '0.83rem', cursor: 'pointer', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 9, transition: 'all 0.2s' }}>
                  <FolderIcon active={activeFolder === i} />{folder.name}
                </button>
              ))}
            </div>
          )}

          <div style={{ flex: '1 1 300px', minWidth: 0 }}>
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
                      <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.82rem', color: 'white', marginBottom: isMobile ? 0 : 9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{model.name}</p>
                      {!isMobile && (
                        <button className="btn-glass-hover" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 10px', color: 'rgba(255,255,255,0.65)', fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <DownloadIcon /> Download
                        </button>
                      )}
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
                {!isMobile && (
                  <button className="btn-white-glow" style={{ background: 'white', color: 'black', border: 'none', borderRadius: 10, padding: '11px 20px', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                    <DownloadIcon /> Download Workflow
                  </button>
                )}
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
                <button type="submit" className="btn-gradient" style={{ borderRadius: 10, padding: '14px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
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

/* ── Inline license picker (shown under each character card) ── */
function CharLicensePicker({ char, selectedCard, licenseByChar, setLicenseByChar, runpodByCard, nsfwEnabled, setPage }) {
  if (!selectedCard) {
    return (
      <div style={{ marginTop: 'auto', borderRadius: 10, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.76rem', color: 'rgba(255,255,255,0.3)' }}>
          ↑ Select a product type above first
        </span>
      </div>
    );
  }

  const pt = PRODUCT_TYPES.find(p => p.id === selectedCard);
  const basePrice = parseInt(pt.from.replace('$', ''));
  const openPrice = Math.round(basePrice * 0.5);
  const license = licenseByChar[char.name] || null;
  const isComplete = selectedCard === 'complete';
  const runpodOn = runpodByCard[selectedCard] || false;
  const runpodCost = runpodOn ? (isComplete ? 15 : 30) : 0;
  const nsfwActive = nsfwEnabled || isComplete;
  const nsfwCost = nsfwActive ? (isComplete ? 0 : 49) : 0;
  const licensePrice = license === 'exclusive' ? basePrice : license === 'open' ? openPrice : 0;
  const totalPrice = license ? licensePrice + runpodCost + nsfwCost : 0;

  const handleAddToCart = () => {
    if (!license) return;
    const cartItem = {
      type: 'package',
      productId: selectedCard,
      productLabel: pt.label,
      character: char.name,
      licenseType: license,
      baseProductPrice: basePrice,
      licensePrice,
      runpodEnabled: runpodOn,
      runpodPrice: isComplete ? 15 : 30,
      nsfwEnabled: nsfwActive,
      nsfwFree: isComplete,
      nsfwPrice: isComplete ? 0 : 49,
    };
    localStorage.setItem('atreox_cart_v1', JSON.stringify(cartItem));
    setPage('checkout');
  };

  const LicenseOption = ({ type, price, accentColor, label, desc, dealTag }) => {
    const sel = license === type;
    return (
      <div
        onClick={() => setLicenseByChar(prev => ({ ...prev, [char.name]: type }))}
        style={{
          borderRadius: 10, padding: '11px 13px',
          border: sel ? `1px solid ${accentColor}80` : '1px solid rgba(255,255,255,0.08)',
          background: sel ? `${accentColor}09` : 'rgba(255,255,255,0.02)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
          transition: 'border-color 0.2s, background 0.2s',
          boxShadow: sel ? `0 0 16px ${accentColor}18` : undefined,
        }}>
        <div style={{
          width: 15, height: 15, borderRadius: '50%', flexShrink: 0, transition: 'all 0.2s',
          border: sel ? `5px solid ${accentColor}` : '2px solid rgba(255,255,255,0.2)',
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.82rem', color: 'white' }}>{label}</span>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1rem', color: accentColor }}>${price}</span>
            {dealTag && <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: '0.58rem', color: accentColor, background: `${accentColor}18`, borderRadius: 9999, padding: '1px 7px', letterSpacing: '0.06em' }}>{dealTag}</span>}
          </div>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.69rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.35, margin: 0 }}>{desc}</p>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 4 }}>
      <LicenseOption type="exclusive" price={basePrice + runpodCost} accentColor="#f59e0b"
        label="Exclusive" desc="Yours only. Removed from store after purchase." />
      <LicenseOption type="open" price={openPrice + runpodCost} accentColor="#34d399"
        label="Open — 50% off" desc="Same quality. Others can also buy this character." dealTag="BEST DEAL" />
      <button
        onClick={handleAddToCart}
        disabled={!license}
        className={license ? 'btn-gradient' : ''}
        style={{
          marginTop: 2, borderRadius: 10, padding: '12px 14px', border: license ? 'none' : '1px solid rgba(255,255,255,0.1)',
          color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.85rem',
          cursor: license ? 'pointer' : 'default', width: '100%', minHeight: 44,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          opacity: license ? 1 : 0.4,
          background: license ? undefined : 'rgba(255,255,255,0.04)',
        }}>
        {license ? <>Go to Checkout — ${totalPrice} <ArrowUpRight size={13} /></> : 'Select a license first'}
      </button>
    </div>
  );
}

/* ── Product type cards (Level 1) ── */
const PRODUCT_TYPES = [
  { id: 'lora',     label: 'Z-Image Turbo LoRA',  subtitle: 'Ultra-realistic character. 200–500 MB. Loads on top of base model.', bestFor: 'Tinkerers and fast movers who already know ComfyUI', from: '$49',  color: '#4f8ef7' },
  { id: 'model',    label: 'Flux Fine-tune Model', subtitle: 'Ultra-consistent character. 4 files (~24 GB). Standalone.', bestFor: 'Serious creators who want pro-grade results', from: '$99',  color: '#34d399' },
  { id: 'wan',      label: 'WAN Video LoRA',       subtitle: 'Ultra-realistic motion + character consistency in video.', bestFor: 'Creators making video for TikTok / IG / Fanvue', from: '$149', color: '#a78bfa' },
  { id: 'complete', label: 'Complete Package',     subtitle: 'Flux + Z-Image LoRA + WAN LoRA + workflow + custom nodes.', bestFor: 'Anyone serious about launching an AI influencer', from: '$299', color: '#f59e0b', popular: true },
];

/* ── Product type card ── */
function ProductTypeCard({ pt, index, inView, selectedCard, onSelect, runpodEnabled, onRunpodToggle }) {
  const [showTip, setShowTip] = useState(false);
  const isComplete = pt.id === 'complete';
  const basePrice = parseInt(pt.from.replace('$', ''));
  const totalPrice = runpodEnabled ? `$${basePrice + (isComplete ? 15 : 30)}` : pt.from;
  const isSelected = selectedCard === pt.id;
  const isDimmed = selectedCard !== null && !isSelected;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: index * 0.08 }}
      className="liquid-glass glass-card-interactive"
      onClick={() => onSelect(pt.id)}
      style={{
        borderRadius: 20, padding: '28px 22px',
        border: isSelected ? `2px solid ${pt.color}99` : (pt.popular ? `1px solid ${pt.color}44` : '1px solid rgba(255,255,255,0.07)'),
        display: 'flex', flexDirection: 'column', position: 'relative',
        opacity: isDimmed ? 0.55 : 1,
        boxShadow: isSelected ? `0 0 28px ${pt.color}30, 0 0 0 1px ${pt.color}44` : undefined,
        cursor: 'pointer',
        transition: 'opacity 0.25s, box-shadow 0.25s, border-color 0.25s',
      }}>
      {/* color top-line */}
      <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: `linear-gradient(90deg, transparent, ${isSelected ? pt.color + 'cc' : pt.color + '55'}, transparent)`, transition: 'all 0.25s' }} />
      {/* Popular badge */}
      {pt.popular && (
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{ background: `linear-gradient(135deg, ${pt.color}, #a78bfa)`, borderRadius: 9999, padding: '4px 14px', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.62rem', color: 'white', letterSpacing: '0.07em', textTransform: 'uppercase', display: 'inline-block' }}>Most Popular</span>
        </div>
      )}
      {/* Selected checkmark */}
      {isSelected && (
        <div style={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderRadius: '50%', background: pt.color, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
          <Check size={11} color="black" />
        </div>
      )}
      {/* Icon */}
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${pt.color}18`, border: `1px solid ${pt.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.1rem', color: pt.color, lineHeight: 1 }}>
          {pt.id === 'lora' ? 'L' : pt.id === 'model' ? 'M' : pt.id === 'wan' ? 'V' : 'P'}
        </span>
      </div>
      <h3 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.92rem', color: 'white', marginBottom: 6, lineHeight: 1.3 }}>{pt.label}</h3>
      <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 14, flex: 1 }}>{pt.subtitle}</p>
      {/* Best for */}
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>Best for: </span>
        <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.77rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.45 }}>{pt.bestFor}</span>
      </div>
      {/* Workflow line */}
      <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.71rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.5, marginBottom: 16, fontStyle: 'italic' }}>
        Includes ATREOX workflow .json — works with our pipeline or your own setup.
      </p>
      {/* Price */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 14 }}>
        <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>from</span>
        <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '2rem', color: pt.color, lineHeight: 1 }}>{totalPrice}</span>
      </div>
      {/* RunPod toggle */}
      <div style={{ marginBottom: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={e => { e.stopPropagation(); onRunpodToggle(pt.id); }}
            style={{ width: 36, height: 20, borderRadius: 10, border: 'none', background: runpodEnabled ? pt.color : 'rgba(255,255,255,0.12)', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
            <div style={{ position: 'absolute', top: 2, left: runpodEnabled ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
          </button>
          {isComplete ? (
            <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.78rem', color: runpodEnabled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.45)', flex: 1 }}>
              RunPod Setup — <span style={{ textDecoration: 'line-through', color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem' }}>$30</span> <span style={{ color: '#34d399', fontWeight: 600 }}>$15</span>
            </span>
          ) : (
            <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.78rem', color: runpodEnabled ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.45)', flex: 1 }}>
              + RunPod Setup <span style={{ color: pt.color }}>+$30</span>
            </span>
          )}
          <div style={{ position: 'relative' }}>
            <button
              onClick={e => e.stopPropagation()}
              onMouseEnter={() => setShowTip(true)} onMouseLeave={() => setShowTip(false)}
              onFocus={() => setShowTip(true)} onBlur={() => setShowTip(false)}
              style={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', fontSize: '0.6rem', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow, sans-serif', fontWeight: 600 }}>?</button>
            {showTip && (
              <div style={{ position: 'absolute', bottom: '130%', right: 0, width: 220, background: 'rgba(18,18,28,0.98)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '12px 14px', zIndex: 50, pointerEvents: 'none' }}>
                <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.55, margin: 0 }}>We set up a ready-to-go RunPod account with your model, ComfyUI installed, and $15 starter credit. Just log in and generate.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* CTA */}
      <button
        onClick={e => { e.stopPropagation(); onSelect(pt.id); document.getElementById('characters-section')?.scrollIntoView({ behavior: 'smooth' }); }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 10, padding: '10px 14px', background: isSelected ? `${pt.color}28` : `${pt.color}18`, border: `1px solid ${pt.color}${isSelected ? '60' : '30'}`, color: pt.color, fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.8rem', cursor: 'pointer', minHeight: 44, transition: 'all 0.2s' }}>
        See characters <ArrowUpRight size={13} />
      </button>
    </motion.div>
  );
}

/* ── Character Gallery Modal ── */
function CharGalleryModal({ char, onClose }) {
  const [fullImg, setFullImg] = useState(null);
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') { if (fullImg) setFullImg(null); else onClose(); } };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [fullImg, onClose]);
  const content = (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(5,5,15,0.9)', backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.22 }}
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 800, background: 'rgba(10,10,22,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '22px 26px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.8rem', color: 'white', margin: 0 }}>{char.name}</h2>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: 18, overflowY: 'auto' }}>
          <style>{`.gal-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}@media(max-width:520px){.gal-grid{grid-template-columns:repeat(2,1fr)!important}}.gal-thumb{overflow:hidden;border-radius:10px;cursor:pointer;border:1px solid rgba(255,255,255,0.07);aspect-ratio:1/1}.gal-thumb img{width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.3s ease}.gal-thumb:hover img{transform:scale(1.05)}`}</style>
          <div className="gal-grid">
            {char.gallery.map((src, i) => (
              <div key={i} className="gal-thumb" onClick={() => setFullImg(src)}>
                <img src={src} loading="lazy" alt={`${char.name} ${i + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      {fullImg && (
        <div onClick={() => setFullImg(null)} style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.93)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <img src={fullImg} alt="Full size" style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 12 }} />
          <button onClick={() => setFullImg(null)} style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.6)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
  return window.ReactDOM.createPortal(content, document.body);
}

/* ── Character card badges ── */
function TypeBadge({ label, available, color }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: available ? `${color}18` : 'rgba(255,255,255,0.05)', border: `1px solid ${available ? color + '40' : 'rgba(255,255,255,0.1)'}`, borderRadius: 6, padding: '3px 8px' }}>
      <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.65rem', color: available ? color : 'rgba(255,255,255,0.3)', letterSpacing: '0.04em' }}>{label}</span>
      {available && <span style={{ fontSize: '0.6rem', color }}>✓</span>}
    </div>
  );
}

function PricingPage({ setPage, user, onLoginClick }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [licenseByChar, setLicenseByChar] = useState({});
  const [runpodByCard, setRunpodByCard] = useState({ lora: false, model: false, wan: false, complete: false });
  const [nsfwEnabled, setNsfwEnabled] = useState(false);
  const [galleryChar, setGalleryChar] = useState(null);

  const { h: ch, m: cm, s: cs } = useCountdown();
  const hasPurchased = (() => {
    try { return !!JSON.parse(localStorage.getItem('atreox_course_access') || 'null')?.sessionId; } catch { return false; }
  })();
  const handleGetAccess = () => {
    if (hasPurchased) { window.location.href = '/course'; }
    else if (!user) { onLoginClick(); }
    else { setPage('checkout'); }
  };
  const CourseTimerBlock = ({ val, label }) => (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div className="liquid-glass" style={{ borderRadius: 10, padding: '10px 6px', marginBottom: 5 }}>
        <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '2rem', color: 'white', lineHeight: 1, display: 'block' }}>{val}</span>
      </div>
      <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
    </div>
  );

  const handleSelectCard = (id) => setSelectedCard(prev => prev === id ? null : id);
  const handleRunpodToggle = (id) => setRunpodByCard(prev => ({ ...prev, [id]: !prev[id] }));

  const level1Ref = useRef(null);
  const level1InView = useInView(level1Ref, { once: true, amount: 0.1 });
  const charsRef = useRef(null);
  const charsInView = useInView(charsRef, { once: true, amount: 0.1 });
  const faqRef = useRef(null);
  const faqInView = useInView(faqRef, { once: true, amount: 0.15 });

  const characters = [
    {
      name: 'Lina',
      preview: '/public/showcase/lina/4.jpeg',
      gallery: ['/public/showcase/lina/1.jpeg', '/public/showcase/lina/2.jpeg', '/public/showcase/lina/3.jpeg', '/public/showcase/lina/4.jpeg', '/public/showcase/lina/5.jpeg', '/public/showcase/lina/6.jpeg'],
      available: { lora: true, model: true, wan: true, complete: true },
    },
    {
      name: 'Rhein',
      preview: '/public/showcase/rhein/4.jpeg',
      gallery: ['/public/showcase/rhein/1.jpeg', '/public/showcase/rhein/2.jpeg', '/public/showcase/rhein/3.jpeg', '/public/showcase/rhein/4.jpeg', '/public/showcase/rhein/5.jpeg', '/public/showcase/rhein/6.jpeg'],
      available: { lora: true, model: true, wan: true, complete: true },
    },
    {
      name: 'Katie',
      preview: '/public/showcase/katie/3.jpeg',
      gallery: ['/public/showcase/katie/1.jpeg', '/public/showcase/katie/2.jpeg', '/public/showcase/katie/3.jpeg', '/public/showcase/katie/4.jpeg', '/public/showcase/katie/5.jpeg', '/public/showcase/katie/6.jpeg'],
      available: { lora: true, model: true, wan: true, complete: true },
    },
    {
      name: 'Sophie',
      preview: '/public/showcase/sophie/2.jpeg',
      gallery: ['/public/showcase/sophie/1.jpeg', '/public/showcase/sophie/2.jpeg', '/public/showcase/sophie/3.jpeg', '/public/showcase/sophie/4.jpeg', '/public/showcase/sophie/5.jpeg', '/public/showcase/sophie/6.jpeg'],
      available: { lora: true, model: true, wan: true, complete: true },
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
      <section data-bg-palette="blue-violet" style={{ paddingTop: 160, paddingBottom: 80, paddingLeft: '5%', paddingRight: '5%', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
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
            <ProductTypeCard
              key={pt.id} pt={pt} index={i} inView={level1InView}
              selectedCard={selectedCard}
              onSelect={handleSelectCard}
              runpodEnabled={runpodByCard[pt.id]}
              onRunpodToggle={handleRunpodToggle}
            />
          ))}
        </div>

        {/* NSFW Add-on card */}
        <div style={{ marginTop: 20 }}>
          <div
            onClick={() => selectedCard !== 'complete' && setNsfwEnabled(v => !v)}
            className="liquid-glass"
            style={{
              borderRadius: 16, padding: '18px 22px',
              border: (nsfwEnabled || selectedCard === 'complete') ? '1px solid rgba(232,121,249,0.5)' : '1px solid rgba(255,255,255,0.07)',
              boxShadow: (nsfwEnabled || selectedCard === 'complete') ? '0 0 20px rgba(232,121,249,0.12)' : undefined,
              display: 'flex', alignItems: 'center', gap: 18, cursor: selectedCard === 'complete' ? 'default' : 'pointer',
              opacity: 1, transition: 'border-color 0.25s, box-shadow 0.25s',
              flexWrap: 'wrap',
            }}>
            {/* Checkbox */}
            <div style={{
              width: 22, height: 22, borderRadius: 6, flexShrink: 0,
              border: (nsfwEnabled || selectedCard === 'complete') ? '2px solid #e879f9' : '2px solid rgba(255,255,255,0.2)',
              background: (nsfwEnabled || selectedCard === 'complete') ? 'rgba(232,121,249,0.2)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
            }}>
              {(nsfwEnabled || selectedCard === 'complete') && <Check size={13} color="#e879f9" />}
            </div>
            {/* Content */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.92rem', color: 'white' }}>NSFW Workflow + Anatomy LoRA</span>
                {selectedCard === 'complete' ? (
                  <span style={{ background: 'rgba(232,121,249,0.15)', border: '1px solid rgba(232,121,249,0.3)', borderRadius: 9999, padding: '2px 10px', fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.65rem', color: '#e879f9', letterSpacing: '0.05em' }}>Free with Complete Package</span>
                ) : (
                  <span style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9999, padding: '2px 10px', fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>Free with Complete Package</span>
                )}
              </div>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: 'rgba(255,255,255,0.48)', lineHeight: 1.55, margin: 0 }}>
                Our custom anatomy-correcting LoRA + the full ATREOX NSFW workflow for ComfyUI. Fixes common AI anatomy failures — hands, proportions, skin — without heavy prompting.
              </p>
            </div>
            {/* Price */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              {selectedCard === 'complete' ? (
                <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.6rem', color: '#34d399', lineHeight: 1 }}>Included</span>
              ) : (
                <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.6rem', color: nsfwEnabled ? '#e879f9' : 'rgba(255,255,255,0.55)', lineHeight: 1 }}>$49</span>
              )}
            </div>
          </div>
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
              Select a product above, then choose your license type below
            </p>
          </div>

          {/* Character grid — 3 cols desktop, 2 tablet, 1 mobile */}
          <style>{`
            .char-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
            @media(max-width:900px){.char-grid{grid-template-columns:repeat(2,1fr)!important}}
            @media(max-width:520px){.char-grid{grid-template-columns:1fr!important}}
            .char-card{transition:transform 0.3s ease,border-color 0.3s ease,box-shadow 0.3s ease}
            .char-card:hover{transform:translateY(-4px);border-color:rgba(139,92,246,0.45)!important;box-shadow:0 10px 36px rgba(139,92,246,0.14)}
            .char-preview-img{transition:transform 0.4s ease}
            .char-card:hover .char-preview-img{transform:scale(1.04)}
            @media(max-width:768px){.char-preview{height:280px!important}}
          `}</style>
          <div className="char-grid">
            {/* Available character cards */}
            {characters.map((char, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} animate={charsInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.09 }}
                className="liquid-glass char-card"
                style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
                {/* Preview: single image */}
                <div className="char-preview" style={{ height: 380, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', flexShrink: 0 }}>
                  <img src={char.preview} loading="lazy" alt={char.name} className="char-preview-img"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                {/* Card body */}
                <div style={{ padding: '16px 16px 18px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.3rem', color: 'white', lineHeight: 1 }}>{char.name}</h3>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <TypeBadge label="LoRA" available={char.available.lora} color="#4f8ef7" />
                    <TypeBadge label="Model" available={char.available.model} color="#34d399" />
                    <TypeBadge label="WAN" available={char.available.wan} color="#a78bfa" />
                    <TypeBadge label="Pack" available={char.available.complete} color="#f59e0b" />
                  </div>
                  <button
                    onClick={() => setGalleryChar(char)}
                    className="liquid-glass btn-glass-hover"
                    style={{ borderRadius: 10, padding: '9px 14px', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.65)', fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.8rem', cursor: 'pointer', background: 'rgba(255,255,255,0.04)', minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    View Gallery <ArrowUpRight size={12} />
                  </button>
                  <CharLicensePicker
                    char={char}
                    selectedCard={selectedCard}
                    licenseByChar={licenseByChar}
                    setLicenseByChar={setLicenseByChar}
                    runpodByCard={runpodByCard}
                    nsfwEnabled={nsfwEnabled}
                    setPage={setPage}
                  />
                </div>
              </motion.div>
            ))}

            {/* Card 5: Coming Soon */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={charsInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.36 }}
              className="liquid-glass"
              style={{ borderRadius: 20, border: '1px dashed rgba(255,255,255,0.13)', display: 'flex', flexDirection: 'column', opacity: 0.72 }}>
              <div style={{ aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.05))' }}>
                <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '5rem', color: 'rgba(255,255,255,0.07)', lineHeight: 1, userSelect: 'none' }}>?</span>
              </div>
              <div style={{ padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.3rem', color: 'white', lineHeight: 1 }}>New character</h3>
                  <span style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.28)', borderRadius: 9999, padding: '2px 10px', fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.6rem', color: '#f87171', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>Dropping soon</span>
                </div>
                <button className="liquid-glass" onClick={() => setPage('contact')} style={{ marginTop: 'auto', borderRadius: 10, padding: '11px', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.82rem', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', minHeight: 44 }}>
                  Join waitlist
                </button>
              </div>
            </motion.div>

            {/* Card 6: Custom Character */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={charsInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.45 }}
              className="liquid-glass glass-card-interactive"
              style={{ borderRadius: 20, border: '1px dashed rgba(255,255,255,0.15)', display: 'flex', flexDirection: 'column', minHeight: 300 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '36px 28px', textAlign: 'center', gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.5rem', lineHeight: 1, color: 'rgba(255,255,255,0.7)' }}>+</span>
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.3rem', color: 'white', marginBottom: 8 }}>Custom Character</h3>
                  <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: 'rgba(255,255,255,0.42)', lineHeight: 1.6, maxWidth: 220, margin: '0 auto 10px' }}>Your concept. Your face. Your brand. We build it from scratch.</p>
                  <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Starting at +10% of selected package</p>
                </div>
                <button className="liquid-glass btn-glass-hover" onClick={() => setPage('contact')} style={{ borderRadius: 10, padding: '11px 20px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.82rem', cursor: 'pointer', background: 'rgba(255,255,255,0.07)', minHeight: 44 }}>
                  Request Custom
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

      {/* ── Course Section Divider ── */}
      <section data-bg-palette="blue-violet" style={{ padding: '100px 5% 0', maxWidth: 1280, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.25)', borderRadius: 9999, padding: '5px 18px', marginBottom: 24 }}>
            <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.7rem', color: '#4f8ef7', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Course</span>
          </div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: 'white', letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 16 }}>
            Learn to do it yourself
          </h2>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.48)', maxWidth: 480, margin: '0 auto', lineHeight: 1.65 }}>
            Master the full pipeline — Flux fine-tuning, WAN video, ComfyUI workflows. Build your own characters from scratch.
          </p>
        </div>
      </section>

      {/* ── Course Card ── */}
      <section style={{ padding: '48px 5% 100px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div className="liquid-glass-strong" style={{ flex: '1 1 500px', borderRadius: 28, padding: '44px 40px', border: '1px solid rgba(255,255,255,0.13)', position: 'relative', overflow: 'hidden' }}>
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
              <strong style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>4 new lessons added every month</strong> to keep you at the cutting edge.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 28px', marginBottom: 36 }}>
              {['FLUX.1 & SDXL photoreal generation','WAN Video for AI video creation','Full ComfyUI node-based workflows','4 new lessons added every month','Build your own AI influencer','Downloadable workflow files','Community Discord access','Lifetime course updates'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                  <Check size={13} color="#34d399" style={{ marginTop: 3, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.82rem', color: 'rgba(255,255,255,0.68)', lineHeight: 1.45 }}>{f}</span>
                </div>
              ))}
            </div>
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
            <button className="btn-white-glow" onClick={handleGetAccess} style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', background: 'white', color: 'black', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {hasPurchased ? 'Continue Learning' : user ? 'Proceed to Checkout' : 'Get Access Now'} <ArrowUpRight size={16} />
            </button>
            {!user && <p style={{ textAlign: 'center', marginTop: 10, fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.73rem', color: 'rgba(255,255,255,0.3)' }}>Login or create an account to purchase</p>}
            <p style={{ textAlign: 'center', marginTop: user ? 12 : 6, fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.73rem', color: 'rgba(255,255,255,0.3)' }}>Cancel anytime · Instant access · 4 new lessons / month</p>
          </div>

          <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="liquid-glass" style={{ borderRadius: 20, padding: '24px', border: '1px solid rgba(248,113,113,0.18)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Clock size={15} color="#f87171" />
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.82rem', color: '#f87171' }}>Offer expires in</span>
              </div>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>Save 40% — limited time discount</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <CourseTimerBlock val={ch} label="Hours" />
                <CourseTimerBlock val={cm} label="Minutes" />
                <CourseTimerBlock val={cs} label="Seconds" />
              </div>
            </div>
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
          </div>
        </div>
      </section>

      <div style={{ padding: '0 5% 64px' }}>
        <FooterBar setPage={setPage} />
      </div>

      {galleryChar && <CharGalleryModal char={galleryChar} onClose={() => setGalleryChar(null)} />}
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
    { trigger: 'I want everything to start a real AI influencer business', result: 'Complete Package', price: '$299', color: '#f59e0b', highlight: true },
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
      <section style={{ position: 'relative', height: '70vh', minHeight: 580, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', paddingTop: 80 }}>
        {/* Content */}
        <div style={{ textAlign: 'center', paddingLeft: '5%', paddingRight: '5%', maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <SectionBadge>Education</SectionBadge>
          <BlurText text="How ATREOX works" style={{
            fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
            fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)', color: 'white',
            lineHeight: 0.92, letterSpacing: '-3px', marginTop: 20, marginBottom: 32,
          }} delay={90} />
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }}
            style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1.05rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.75, marginBottom: 20 }}>
            ATREOX builds production-ready AI influencer characters — trained faces, video models, and full ComfyUI workflows. We train each character by hand, run 500+ test generations before release, and ship everything you need to start publishing content and earning from day one.
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0, duration: 0.6 }}
            style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1.05rem', color: 'rgba(255,255,255,0.48)', lineHeight: 1.75 }}>
            This page covers what we sell, why it's priced the way it is, and how to pick the right product for where you're starting from.
          </motion.p>
        </div>
      </section>

      {/* Section 0 — The 3-step version (still on dark bg) */}
      <section data-bg-palette="blue-violet" className="section-block" style={{ padding: '80px 5%', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ ...h2Style, marginBottom: 16 }}>The 3-step version</h2>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.48)', lineHeight: 1.65 }}>
            Here's what the whole process looks like — no jargon.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 52 }}>
          {[
            { step: '01', title: 'Pick a character', body: 'Browse our ready-made characters or request a custom one. Each one is a unique AI person with a consistent face.' },
            { step: '02', title: 'Get your files', body: 'You receive an AI model that generates unlimited photos and videos of your character. Plus workflows, guides, and starter content.' },
            { step: '03', title: 'Launch and grow', body: 'Post on your platforms. Build an audience. Start earning. We give you the tools — you run the show.' },
          ].map(({ step, title, body }, i) => (
            <div key={i} className="liquid-glass" style={{ borderRadius: 24, padding: '36px 30px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '3rem', color: 'rgba(255,255,255,0.08)', lineHeight: 1, marginBottom: 16 }}>{step}</div>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.5rem', color: 'white', lineHeight: 1.1, marginBottom: 12 }}>{title}</h3>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.88rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>{body}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)', marginBottom: 20 }} />
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.28)', fontStyle: 'italic' }}>
            Want the technical details? Keep reading.
          </p>
        </div>
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

      {/* Section 2 — What we actually sell */}
      <section ref={s2Ref} data-bg-palette="teal-violet" className="section-block" style={{ padding: '80px 5%', maxWidth: 1100, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={s2InView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.65 }}>
          <SectionBadge>Section 2</SectionBadge>
          <h2 style={{ ...h2Style, marginTop: 14 }}>What we actually sell</h2>
          <p style={{ ...bodyText, marginBottom: 36 }}>Four products. Each one solves a different part of the AI influencer pipeline. Mix and match, or go all-in with the Complete Package.</p>

          <style>{`.sell-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}@media(max-width:640px){.sell-grid{grid-template-columns:1fr!important}}`}</style>
          <div className="sell-grid" style={{ marginBottom: 28 }}>
            {/* Card A: Flux Fine-tune */}
            {[
              { color: '#34d399', letter: 'M', title: 'Flux Fine-tune Model', detail: '4 files · ~24 GB · standalone', desc: 'A complete character model trained entirely on your AI influencer. Maximum consistency — same face, body, and style every generation. Works as a drop-in replacement for any Flux base.', price: '$99', tag: 'Static image · brand-quality shots' },
              { color: '#4f8ef7', letter: 'L', title: 'Z-Image Turbo LoRA',   detail: '1 file · 200–500 MB · adapter', desc: 'A lightweight LoRA that loads on top of any Flux base model you already have. Fast to use, lower upfront cost, good for experimenting with different styles.', price: '$49',  tag: 'Fastest to get started' },
              { color: '#a78bfa', letter: 'V', title: 'WAN Video LoRA',       detail: '1 file · ~600 MB · adapter', desc: 'Teaches the WAN video model to render your specific character in motion. Your AI influencer walks, talks, and poses with the same face across every frame — for TikTok, Reels, and Fanvue.', price: '$149', tag: 'Video · requires Flux base or fine-tune' },
              { color: '#f59e0b', letter: 'P', title: 'NSFW Workflow + Anatomy LoRA', detail: 'workflow + LoRA bundle', desc: 'Our custom anatomy-correcting LoRA + the full ATREOX NSFW workflow for ComfyUI. Fixes the common AI anatomy failures — hands, proportions, skin — without heavy prompting.', price: '$99 standalone', tag: 'Free with Complete Package', tagColor: '#f59e0b' },
            ].map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} animate={s2InView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 + i * 0.07 }}
                className="liquid-glass"
                style={{ borderRadius: 18, padding: '28px 26px', border: `1px solid ${card.color}28`, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: `${card.color}18`, border: `1px solid ${card.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.05rem', color: card.color }}>{card.letter}</span>
                    </div>
                    <div>
                      <h3 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.92rem', color: 'white', lineHeight: 1.2, marginBottom: 3 }}>{card.title}</h3>
                      <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>{card.detail}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.5rem', color: card.color, lineHeight: 1 }}>{card.price}</span>
                  </div>
                </div>
                <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{card.desc}</p>
                <div style={{ display: 'inline-flex', alignSelf: 'flex-start', background: `${card.tagColor || card.color}14`, border: `1px solid ${card.tagColor || card.color}30`, borderRadius: 7, padding: '3px 10px' }}>
                  <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.67rem', color: card.tagColor || card.color, letterSpacing: '0.04em' }}>{card.tag}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <p style={mutedNote}>Every product ships with our ATREOX workflow .json — works with our pipeline or your own ComfyUI setup. No vendor lock-in.</p>
        </motion.div>
      </section>

      {/* Section 2b — Want a ready-to-go setup? */}
      <section data-bg-palette="teal-violet" className="section-block" style={{ padding: '0 5% 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="liquid-glass" style={{ borderRadius: 20, padding: '32px 36px', border: '1px solid rgba(79,142,247,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 28, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '1rem', color: 'white', marginBottom: 8 }}>Want a ready-to-go setup?</h3>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: 540 }}>
              Add <strong style={{ color: 'white', fontWeight: 500 }}>RunPod Setup (+$30)</strong> to any package at checkout. We configure a RunPod cloud GPU account with your model pre-loaded, ComfyUI installed, and <strong style={{ color: 'white', fontWeight: 500 }}>$15 starter credit</strong> included. Log in and start generating within minutes — no local hardware, no setup headaches.
            </p>
          </div>
          <button className="btn-gradient" onClick={() => setPage('pricing')}
            style={{ borderRadius: 9999, padding: '13px 28px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 44, flexShrink: 0 }}>
            Browse Packages <ArrowUpRight size={15} />
          </button>
        </div>
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
            <button className="btn-gradient" onClick={() => setPage('pricing')}
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

/* ══════════════════════════════════════
   SETTINGS PAGE
══════════════════════════════════════ */
function SettingsPage({ setPage, user, onLogout }) {
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const inputStyle = { background: 'none', border: 'none', outline: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', width: '100%' };
  const labelStyle = { fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.76rem', color: 'rgba(255,255,255,0.45)', marginBottom: 6, display: 'block' };

  const hasPurchased = (() => { try { return !!JSON.parse(localStorage.getItem('atreox_course_access') || 'null')?.sessionId; } catch { return false; } })();
  const packageCart = (() => { try { return JSON.parse(localStorage.getItem('atreox_cart_v1') || 'null'); } catch { return null; } })();

  const handleSaveProfile = () => {
    if (!name.trim()) return;
    try {
      const users = JSON.parse(localStorage.getItem('atreox_users_v1') || '[]');
      const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
      if (idx >= 0) { users[idx].name = name.trim(); localStorage.setItem('atreox_users_v1', JSON.stringify(users)); }
      localStorage.setItem('atreox_cur_v1', JSON.stringify({ name: name.trim(), email }));
    } catch {}
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 2500);
  };

  const handleChangePassword = () => {
    setPwError(''); setPwSuccess(false);
    if (!currentPw || !newPw || !confirmPw) { setPwError('Fill in all password fields.'); return; }
    if (newPw !== confirmPw) { setPwError('New passwords do not match.'); return; }
    if (newPw.length < 6) { setPwError('Password must be at least 6 characters.'); return; }
    try {
      const users = JSON.parse(localStorage.getItem('atreox_users_v1') || '[]');
      const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
      if (idx < 0 || users[idx].password !== currentPw) { setPwError('Current password is incorrect.'); return; }
      users[idx].password = newPw;
      localStorage.setItem('atreox_users_v1', JSON.stringify(users));
    } catch { setPwError('Could not update password.'); return; }
    setPwSuccess(true);
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    setTimeout(() => setPwSuccess(false), 3000);
  };

  const cardStyle = { borderRadius: 20, padding: '28px 28px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 20 };

  return (
    <div>
      <section data-bg-palette="blue-violet" style={{ paddingTop: 160, paddingBottom: 80, paddingLeft: '5%', paddingRight: '5%', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <SectionBadge>Account</SectionBadge>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(2.4rem, 4vw, 3.5rem)', color: 'white', marginTop: 18, marginBottom: 12, letterSpacing: '-0.02em', lineHeight: 0.95 }}>Settings</h1>
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.45)' }}>Manage your ATREOX AI account</p>
      </section>

      <div style={{ padding: '60px 5%', maxWidth: 760, margin: '0 auto' }}>

        {/* My Account */}
        <div className="liquid-glass-strong" style={cardStyle}>
          <h3 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 22 }}>My Account</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#4f8ef7,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '1.2rem', color: 'white' }}>{(user?.name || 'U')[0].toUpperCase()}</span>
            </div>
            <div>
              <p style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.25rem', color: 'white', lineHeight: 1.1 }}>{user?.name}</p>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{user?.email}</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Display Name</label>
              <FieldWrap><input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inputStyle} /></FieldWrap>
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <FieldWrap><input value={email} disabled style={{ ...inputStyle, opacity: 0.4, cursor: 'not-allowed' }} /></FieldWrap>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
              <button onClick={handleSaveProfile} style={{ borderRadius: 10, padding: '11px 24px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                Update Profile
              </button>
              {profileSuccess && <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: '#34d399' }}>Saved ✓</span>}
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="liquid-glass-strong" style={cardStyle}>
          <h3 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 22 }}>Change Password</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Current Password</label>
              <FieldWrap><input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="Current password" style={inputStyle} /></FieldWrap>
            </div>
            <div>
              <label style={labelStyle}>New Password</label>
              <FieldWrap><input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="New password" style={inputStyle} /></FieldWrap>
            </div>
            <div>
              <label style={labelStyle}>Confirm New Password</label>
              <FieldWrap><input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Confirm new password" style={inputStyle} /></FieldWrap>
            </div>
            {pwError && <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.78rem', color: '#f87171' }}>{pwError}</p>}
            {pwSuccess && <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.78rem', color: '#34d399' }}>Password updated successfully ✓</p>}
            <button onClick={handleChangePassword} style={{ alignSelf: 'flex-start', borderRadius: 10, padding: '11px 24px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              Update Password
            </button>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="liquid-glass-strong" style={cardStyle}>
          <h3 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>Enrolled Courses</h3>
          {hasPurchased ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.18)', borderRadius: 12, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.88rem', color: 'white', marginBottom: 3 }}>Photoreal Influencer Blueprint</p>
                <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.76rem', color: 'rgba(255,255,255,0.4)' }}>Active subscription</p>
              </div>
              <button onClick={() => window.location.href = '/course'} style={{ borderRadius: 9, padding: '8px 18px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.8rem', cursor: 'pointer', background: 'rgba(79,142,247,0.2)' }}>
                Continue Learning
              </button>
            </div>
          ) : (
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
              No active courses. <span onClick={() => setPage('pricing')} style={{ color: '#4f8ef7', cursor: 'pointer' }}>Browse courses →</span>
            </p>
          )}
        </div>

        {/* Order History */}
        <div className="liquid-glass-strong" style={cardStyle}>
          <h3 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>Order History</h3>
          {packageCart ? (
            <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.85rem', color: 'white', marginBottom: 3 }}>{packageCart.productLabel} · {packageCart.character}</p>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.76rem', color: 'rgba(255,255,255,0.4)' }}>{packageCart.license} · ${packageCart.licensePrice}</p>
            </div>
          ) : (
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>No orders yet.</p>
          )}
        </div>

        {/* Logout */}
        <div className="liquid-glass-strong" style={{ ...cardStyle, marginBottom: 0 }}>
          <h3 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Session</h3>
          <button onClick={() => { onLogout(); setPage('home'); }} style={{ borderRadius: 10, padding: '11px 24px', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171', fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer', background: 'rgba(248,113,113,0.06)' }}>
            Log out
          </button>
        </div>

      </div>
      <div style={{ padding: '0 5% 64px' }}><FooterBar setPage={setPage} /></div>
    </div>
  );
}

/* ══════════════════════════════════════
   MEET ATREOX PAGE
══════════════════════════════════════ */
function MeetAtreoxPage({ setPage }) {
  const [openFaq, setOpenFaq] = useState(null);
  const s2Ref = useRef(null); const s2InView = useInView(s2Ref, { once: true, amount: 0.15 });
  const s3Ref = useRef(null); const s3InView = useInView(s3Ref, { once: true, amount: 0.15 });
  const s4Ref = useRef(null); const s4InView = useInView(s4Ref, { once: true, amount: 0.15 });
  const s5Ref = useRef(null); const s5InView = useInView(s5Ref, { once: true, amount: 0.15 });

  const bodyText = { fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.82 };
  const h2Style = { fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: 'white', letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 28 };

  const faqs = [
    { q: 'Is this legal?', a: 'Yes. AI-generated content is legal to create and monetize. You own the character and all generated content.' },
    { q: 'Do I need to know anything about AI?', a: 'No. Our packages come ready to use. If you want to learn the process, we have a course for that too.' },
    { q: 'How much can I actually make?', a: 'It depends on your niche, effort, and audience. Some creators make $500/month. Others make $20,000+. We give you the tools — you bring the hustle.' },
  ];

  return (
    <div>
      {/* Section 1 — Quote Hero */}
      <section style={{ position: 'relative', paddingTop: 160, paddingBottom: 0, overflow: 'hidden', minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #000 0%, #000 85%, transparent 100%)', zIndex: 0 }} />
        {/* Particle canvas */}
        <style>{`
          @keyframes meet-float-1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(18px,-22px) scale(1.15)} }
          @keyframes meet-float-2 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-14px,18px)} 66%{transform:translate(20px,8px)} }
          @keyframes meet-float-3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,-12px) scale(0.85)} }
          @keyframes meet-float-4 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(12px,24px)} }
          @keyframes meet-float-5 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-8px,-16px) scale(1.2)} }
          .meet-particle { position:absolute; border-radius:50%; pointer-events:none; }
        `}</style>
        {[
          {w:3,h:3,top:'12%',left:'8%',op:0.25,anim:'meet-float-1 7s ease-in-out infinite'},
          {w:2,h:2,top:'22%',left:'15%',op:0.18,anim:'meet-float-2 9s ease-in-out infinite 1s'},
          {w:4,h:4,top:'8%',left:'28%',op:0.2,anim:'meet-float-3 6s ease-in-out infinite 0.5s'},
          {w:2,h:2,top:'35%',left:'5%',op:0.15,anim:'meet-float-4 11s ease-in-out infinite'},
          {w:3,h:3,top:'55%',left:'12%',op:0.22,anim:'meet-float-1 8s ease-in-out infinite 2s'},
          {w:2,h:2,top:'70%',left:'22%',op:0.16,anim:'meet-float-2 10s ease-in-out infinite 0.8s'},
          {w:4,h:4,top:'18%',left:'40%',op:0.12,anim:'meet-float-3 7s ease-in-out infinite 1.5s'},
          {w:2,h:2,top:'80%',left:'35%',op:0.2,anim:'meet-float-5 9s ease-in-out infinite'},
          {w:3,h:3,top:'10%',left:'55%',op:0.18,anim:'meet-float-1 12s ease-in-out infinite 0.3s'},
          {w:2,h:2,top:'42%',left:'62%',op:0.25,anim:'meet-float-2 8s ease-in-out infinite 1.2s'},
          {w:4,h:4,top:'72%',left:'58%',op:0.14,anim:'meet-float-3 6s ease-in-out infinite 2.5s'},
          {w:2,h:2,top:'25%',left:'75%',op:0.2,anim:'meet-float-4 10s ease-in-out infinite 0.7s'},
          {w:3,h:3,top:'60%',left:'80%',op:0.18,anim:'meet-float-5 7s ease-in-out infinite 1.8s'},
          {w:2,h:2,top:'15%',left:'88%',op:0.22,anim:'meet-float-1 9s ease-in-out infinite 0.4s'},
          {w:4,h:4,top:'85%',left:'78%',op:0.15,anim:'meet-float-2 11s ease-in-out infinite 1.1s'},
          {w:2,h:2,top:'48%',left:'92%',op:0.2,anim:'meet-float-3 8s ease-in-out infinite'},
          {w:3,h:3,top:'30%',left:'48%',op:0.1,anim:'meet-float-4 14s ease-in-out infinite 2.2s'},
          {w:2,h:2,top:'65%',left:'45%',op:0.17,anim:'meet-float-5 7s ease-in-out infinite 0.9s'},
          {w:3,h:3,top:'5%',left:'70%',op:0.14,anim:'meet-float-1 10s ease-in-out infinite 1.6s'},
          {w:2,h:2,top:'92%',left:'50%',op:0.19,anim:'meet-float-2 9s ease-in-out infinite 0.2s'},
        ].map((p, i) => (
          <div key={i} className="meet-particle" style={{
            width: p.w, height: p.h, top: p.top, left: p.left,
            background: `rgba(255,255,255,${p.op})`,
            animation: p.anim,
          }} />
        ))}

        {/* Quote text */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 5%', maxWidth: 1100, margin: '0 auto' }}>
          <motion.p
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(2.4rem, 5.5vw, 4.5rem)', color: 'white', lineHeight: 1.1, marginBottom: 56, letterSpacing: '-0.02em' }}>
            Creativity is intelligence having fun.
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.0 }}
            style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: 'clamp(0.85rem, 2vw, 1.05rem)', color: 'rgba(255,255,255,0.7)', letterSpacing: '3.5px', textTransform: 'uppercase', marginBottom: 40 }}>
            The face is fake. The money is real.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.3 }}
            style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn-gradient" onClick={() => setPage('home')} style={{ borderRadius: 9999, padding: '13px 28px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              Home <ArrowUpRight size={16} />
            </button>
            <button className="liquid-glass btn-glass-hover" onClick={() => setPage('how-it-works')} style={{ borderRadius: 9999, padding: '13px 24px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'rgba(255,255,255,0.07)' }}>
              How It Works <ArrowUpRight size={15} />
            </button>
          </motion.div>
        </div>

        <div style={{ position: 'relative', zIndex: 2, width: '100%', height: 140, marginTop: 60, flexShrink: 0 }} />
      </section>

      {/* Section 1b — Hook stats */}
      <section data-bg-palette="blue-violet" style={{ paddingTop: 60, paddingBottom: 100, paddingLeft: '5%', paddingRight: '5%', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', maxWidth: 960, margin: '0 auto' }}>
        <BlurText text="People are making $5,000–$30,000/month with AI influencers."
          style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(2.4rem, 5vw, 4rem)', color: 'white', lineHeight: 1.0, letterSpacing: '-2px', marginBottom: 28 }}
          delay={80}
        />
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }}
          style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1.1rem', color: 'rgba(255,255,255,0.52)', lineHeight: 1.72, maxWidth: 620, margin: '0 auto 56px' }}>
          No face. No camera. No followers to start. Just an AI character that looks real — and an audience willing to pay for it.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0, duration: 0.6 }}
          style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
          {[
            { val: '$2.1B', label: 'Creator economy revenue from AI-generated content in 2025' },
            { val: '83%', label: 'of fans can\'t tell AI influencers from real ones' },
          ].map(({ val, label }, i) => (
            <div key={i} className="liquid-glass" style={{ borderRadius: 24, padding: '36px 40px', flex: '1 1 220px', maxWidth: 300, border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 0 40px rgba(79,142,247,0.08), 0 0 1px rgba(79,142,247,0.3)' }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(3rem, 5vw, 4rem)', color: 'white', lineHeight: 1, marginBottom: 14 }}>{val}</div>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{label}</p>
            </div>
          ))}
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3, duration: 0.6 }}
          style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.72rem', color: 'rgba(255,255,255,0.22)', fontStyle: 'italic' }}>
          Source: industry estimates. Individual results vary.
        </motion.p>
      </section>

      {/* Section 2 — What is an AI influencer? */}
      <section ref={s2Ref} data-bg-palette="indigo" className="section-block" style={{ padding: '100px 5%', maxWidth: 860, margin: '0 auto', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={s2InView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.65 }}>
          <h2 style={h2Style}>It's a fake person that makes real money.</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <p style={bodyText}>An AI influencer is a digital character — a face, a personality, a brand — that doesn't exist in real life. You create her (or him) once, and then you generate unlimited photos, videos, and content. No scheduling shoots. No bad hair days. No diva moments.</p>
            <p style={bodyText}>The audience doesn't care if she's real. They care if she's interesting. And right now, AI influencers are pulling subscribers on Fanvue, building audiences on Telegram and Instagram, and generating income that rivals real creators.</p>
            <p style={bodyText}>This isn't a fantasy. It's a business model.</p>
          </div>
        </motion.div>
      </section>

      {/* Section 3 — What do you need? */}
      <section ref={s3Ref} data-bg-palette="blue-rose" className="section-block" style={{ padding: '100px 5%', maxWidth: 1100, margin: '0 auto', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={s3InView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.65 }}>
          <h2 style={{ ...h2Style, textAlign: 'center' }}>What it takes to launch</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              { title: 'A character', body: 'A face, a name, a vibe. We create this for you — a unique AI person that generates consistent photos and videos every single time.' },
              { title: 'A platform', body: 'Telegram, Instagram, Fanvue, OnlyFans — pick where your audience lives. We give you the content engine. You pick the stage.' },
              { title: '30 minutes a day', body: 'Post content, reply to messages, grow the audience. The AI makes the content. You run the business.' },
            ].map(({ title, body }, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} animate={s3InView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="liquid-glass"
                style={{ borderRadius: 24, padding: '44px 32px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '3.5rem', color: 'rgba(255,255,255,0.06)', lineHeight: 1, marginBottom: 18 }}>0{i + 1}</div>
                <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.65rem', color: 'white', lineHeight: 1.1, marginBottom: 14 }}>{title}</h3>
                <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.52)', lineHeight: 1.72 }}>{body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Section 4 — Where ATREOX comes in */}
      <section ref={s4Ref} data-bg-palette="deep-violet" className="section-block" style={{ padding: '100px 5%', maxWidth: 860, margin: '0 auto', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={s4InView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.65 }}>
          <h2 style={h2Style}>We build the character. You build the business.</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginBottom: 48 }}>
            <p style={bodyText}>ATREOX gives you production-ready AI characters — the kind that actually fool people. Not blurry AI art. Not uncanny valley. Real-looking humans with consistent faces across hundreds of photos and videos.</p>
            <p style={bodyText}>Every character package includes a trained AI model, starter content, and everything you need to launch in a weekend.</p>
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <button className="btn-gradient" onClick={() => setPage('pricing')}
              style={{ borderRadius: 9999, padding: '14px 32px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              See what we sell <ArrowUpRight size={16} />
            </button>
            <button className="liquid-glass btn-glass-hover" onClick={() => setPage('how-it-works')}
              style={{ borderRadius: 9999, padding: '14px 28px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'rgba(255,255,255,0.07)' }}>
              Understand the tech <ArrowUpRight size={15} />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Section 5 — FAQ */}
      <section ref={s5Ref} data-bg-palette="sky-blue" className="section-block" style={{ padding: '100px 5%', maxWidth: 860, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={s5InView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.65 }}>
          <h2 style={{ ...h2Style, textAlign: 'center' }}>Quick answers</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {faqs.map(({ q, a }, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} animate={s5InView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="liquid-glass" style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.95rem', color: 'white', textAlign: 'left', lineHeight: 1.4 }}>{q}</span>
                  <div style={{ transition: 'transform 0.25s ease', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
                    <ChevronDown size={16} color="rgba(255,255,255,0.4)" />
                  </div>
                </button>
                {openFaq === i && (
                  <div className="faq-answer" style={{ padding: '0 24px 20px' }}>
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 14 }} />
                    <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <div style={{ padding: '0 5% 60px' }}>
        <FooterBar setPage={setPage} />
      </div>
    </div>
  );
}

Object.assign(window, { CoursesPage, CheckoutPage, ResourcesPage, ContactPage, PricingPage, HowItWorksPage, MeetAtreoxPage, SettingsPage });
