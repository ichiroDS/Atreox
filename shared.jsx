
const React = window.React;
const { useState, useEffect, useRef } = React;
const { motion, AnimatePresence, useInView } = window.FramerMotion;

const DASHBOARD_URL = 'https://app.atreoxai.com';

/* ── Brand accent — single source of truth, read via window.ACCENT / window.ACCENT_RGB elsewhere ── */
const ACCENT = '#00d9ff';
const ACCENT_RGB = '0,217,255';

/* ── Inline icon library ── */
const _ip = {
  ArrowUpRight: "M7 17L17 7M7 7h10v10",
  Play: "M6 3l15 9-15 9V3z",
  Zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  BarChart3: "M3 3v18h18M7 16v-5M12 16V8M17 16v-8",
  Shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  Check: "M20 6L9 17l-5-5",
  Star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1L12 2z",
  ChevronRight: "M9 18l6-6-6-6",
  ChevronDown: "M6 9l6 6 6-6",
  Users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  BookOpen: "M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z",
  GitBranch: "M6 3v12M18 9a3 3 0 100 6 3 3 0 000-6zM6 21a3 3 0 100-6 3 3 0 000 6zM18 12H9",
  Code2: "M18 16l4-4-4-4M6 8L2 12l4 4M14.5 4l-5 16",
  Cpu: "M9 3H5a2 2 0 00-2 2v4m6-6h6m-6 0V1m6 2h4a2 2 0 012 2v4m-6-6V1m6 14v4a2 2 0 01-2 2h-4m6-6h2M3 9H1m2 6H1M9 21H5a2 2 0 01-2-2v-4m6 6h6m-6 0v2m6-2h4a2 2 0 002-2v-4m-6 6v2M9 9h6v6H9z",
  Layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  Server: "M2 3h20v6H2zM2 9h20v6H2zM2 15h20v6H2z",
  Globe: "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM2 12h20M12 2c-2.76 3.63-4 7-4 10s1.24 6.37 4 10M12 2c2.76 3.63 4 7 4 10s-1.24 6.37-4 10",
  Brain: "M12 5a3 3 0 10-5.995.142A6 6 0 003 12v1a6 6 0 006 6h6a6 6 0 006-6v-1a6 6 0 00-3.005-5.21A3 3 0 0012 5zM9 13h6M9 16h6",
  Award: "M12 15l-4 7 4-2.4 4 2.4-4-7zM12 15A6 6 0 1012 3a6 6 0 000 12z",
  Clock: "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 6v6l4 2",
  MessageSquare: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  Palette: "M12 2a10 10 0 100 20 2 2 0 002-2c.17-.39.3-.8.3-1.2 0-.6-.5-1.1-1.1-1.1H12a1 1 0 01-1-1V9.1A4.1 4.1 0 0115.1 5c.9.4 1.6 1.2 1.9 2.1",
  TrendingUp: "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
  Sparkles: "M12 3l1.5 3 3.5.5-2.5 2.5.5 3.5L12 11l-3 1.5.5-3.5L7 6.5l3.5-.5L12 3zM5 16l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2zM19 14l.7 1.5 1.5.5-1.5.7-.7 1.5-.7-1.5L17 16l1.3-.5.7-1.5z",
  Network: "M9 3H5a2 2 0 00-2 2v4m6-6h6m-6 0V1M15 3h4a2 2 0 012 2v4M9 3v6m6-6v6M3 9h18M3 15h18M9 15v6m6-6v6M5 21h14a2 2 0 002-2v-4H3v4a2 2 0 002 2z",
  Workflow: "M17 6H3M17 6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 00-2 2v2a2 2 0 002 2h14",
  MonitorPlay: "M10 13l5-3-5-3v6zM4 6h16a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2zM8 21h8M12 19v2",
  X: "M18 6L6 18M6 6l12 12",
  Menu: "M3 6h18M3 12h18M3 18h18",
  Info: "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 16v-4M12 8h.01",
};

function _icon(name, filled) {
  return function Icon({ size = 16, color = 'currentColor', fill, style, opacity, ...rest }) {
    const f = fill !== undefined ? fill : (filled ? color : 'none');
    return React.createElement('svg', {
      width: size, height: size, viewBox: '0 0 24 24',
      fill: f, stroke: color, strokeWidth: 1.75,
      strokeLinecap: 'round', strokeLinejoin: 'round',
      style: { display: 'inline-block', flexShrink: 0, opacity, ...style }, ...rest
    }, React.createElement('path', { d: _ip[name] }));
  };
}

const ArrowUpRight  = _icon('ArrowUpRight');
const Play          = _icon('Play', true);
const Zap           = _icon('Zap');
const BarChart3     = _icon('BarChart3');
const Shield        = _icon('Shield');
const Check         = _icon('Check');
const Star          = _icon('Star', true);
const ChevronRight  = _icon('ChevronRight');
const ChevronDown   = _icon('ChevronDown');
const Users         = _icon('Users');
const BookOpen      = _icon('BookOpen');
const GitBranch     = _icon('GitBranch');
const Code2         = _icon('Code2');
const Cpu           = _icon('Cpu');
const Layers        = _icon('Layers');
const Server        = _icon('Server');
const Globe         = _icon('Globe');
const Brain         = _icon('Brain');
const Award         = _icon('Award');
const Clock         = _icon('Clock');
const MessageSquare = _icon('MessageSquare');
const Palette       = _icon('Palette');
const TrendingUp    = _icon('TrendingUp');
const Sparkles      = _icon('Sparkles');
const Network       = _icon('Network');
const Workflow      = _icon('Workflow');
const MonitorPlay   = _icon('MonitorPlay');
const X             = _icon('X');
const Menu          = _icon('Menu');
const Info          = _icon('Info');

/* ── Wordmark: upright inscriptional-serif logotype, wide balanced tracking ──
   Marcellus caps in brand green — refined lifestyle-brand lockup, plain
   well-kerned O. Negative right margin swallows the trailing letter-space. */
function Wordmark({ size = '1.02rem', glow = true, color = ACCENT }) {
  return (
    <span aria-label="ATREOX" style={{
      fontFamily: "'Marcellus', 'Playfair Display', Georgia, serif",
      fontWeight: 400, fontSize: size, color,
      letterSpacing: '0.32em', marginRight: '-0.32em', lineHeight: 1,
      display: 'inline-block', userSelect: 'none',
      textShadow: glow ? `0 0 20px rgba(${ACCENT_RGB},0.28)` : 'none',
    }}>
      ATREOX
    </span>
  );
}

/* ── Helpers ── */
function SectionBadge({ children }) {
  return <span className="overline">{'// '}{children}</span>;
}
function SectionHeading({ children, style }) {
  return (
    <h2 style={{
      fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500,
      fontSize: 'clamp(2.2rem, 4.6vw, 3.6rem)', color: 'white',
      letterSpacing: '-0.01em', lineHeight: 1.08, ...style
    }}>{children}</h2>
  );
}
function GlassBtn({ children, onClick, white, style }) {
  return (
    <button className={white ? 'btn-solid' : 'btn-outline'} onClick={onClick} style={style}>
      {children}
    </button>
  );
}

/* ── Navbar ── */
function Navbar({ currentPage, setPage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [scrolled, setScrolled] = useState(window.scrollY > 8);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMenuOpen(false);
    };
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const links = [
    { id: 'home',      label: 'Home' },
    { id: 'functions', label: 'Functions' },
    { id: 'pricing',   label: 'Pricing' },
  ];

  const handleNav = (id) => { setPage(id); setMenuOpen(false); };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64,
        padding: '0 clamp(16px, 4vw, 40px)', display: 'flex', alignItems: 'center', gap: 16,
        background: scrolled ? 'rgba(2,6,4,0.88)' : 'rgba(2,6,4,0.5)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid rgba(${ACCENT_RGB},${scrolled ? 0.18 : 0.09})`,
        transition: 'background 0.25s ease, border-color 0.25s ease',
      }}>
        {/* Wordmark */}
        <div onClick={() => handleNav('home')} style={{ cursor: 'pointer', flex: '1 1 0', minWidth: 0, display: 'flex', alignItems: 'center' }}>
          <Wordmark />
        </div>

        {/* Desktop nav */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 30, flexShrink: 0 }}>
            {links.map(link => (
              <button key={link.id}
                className={'nav-link' + (currentPage === link.id ? ' active' : '')}
                onClick={() => handleNav(link.id)}>
                {link.label}
              </button>
            ))}
          </div>
        )}

        {/* Desktop CTA */}
        {!isMobile && (
          <div style={{ flex: '1 1 0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <a href={DASHBOARD_URL} target="_self" className="btn-solid" style={{ padding: '10px 20px', fontSize: '0.7rem' }}>
              Enter panel <ArrowUpRight size={13} />
            </a>
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button onClick={() => setMenuOpen(o => !o)} aria-label="Menu"
            style={{ flexShrink: 0, background: `rgba(${ACCENT_RGB},0.07)`, border: `1px solid rgba(${ACCENT_RGB},0.22)`, borderRadius: 4, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {menuOpen ? <X size={17} color={ACCENT} /> : <Menu size={17} color={ACCENT} />}
          </button>
        )}
      </nav>

      {/* Mobile full-screen menu — editorial serif links with mono indices */}
      {isMobile && menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(2,4,3,0.97)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', display: 'flex', flexDirection: 'column', padding: '96px 28px 40px', gap: 2 }}>
          {links.map((link, i) => (
            <button key={link.id} onClick={() => handleNav(link.id)} style={{
              width: '100%', padding: '20px 4px', border: 'none',
              borderBottom: `1px solid rgba(${ACCENT_RGB},0.12)`,
              background: 'transparent', textAlign: 'left',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500,
              fontSize: '1.9rem', letterSpacing: '-0.01em',
              color: currentPage === link.id ? ACCENT : 'white',
              cursor: 'pointer',
            }}>
              {link.label}
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontStyle: 'normal', fontSize: '0.68rem', letterSpacing: '0.2em', color: `rgba(${ACCENT_RGB},0.5)` }}>
                {String(i + 1).padStart(2, '0')}
              </span>
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <a href={DASHBOARD_URL} target="_self" className="btn-solid" style={{ width: '100%', justifyContent: 'center', padding: '17px', fontSize: '0.82rem' }}>
            Enter panel <ArrowUpRight size={15} />
          </a>
        </div>
      )}
    </>
  );
}

/* ── BlurText ── */
function BlurText({ text, style, delay = 120, glowWords = [] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const words = text.split(' ');
  const glowSet = new Set(glowWords);
  return (
    <span ref={ref} style={{ display: 'block', ...style }}>
      {words.map((word, i) => {
        const isGlow = glowSet.has(word.replace(/[.,!?]+$/, ''));
        return (
          <motion.span key={i}
            initial={{ filter: 'blur(12px)', opacity: 0, y: 48 }}
            animate={isInView ? { filter: 'blur(0px)', opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: i * delay / 1000 }}
            style={{
              display: 'inline-block', marginRight: '0.28em',
              ...(isGlow ? { color: ACCENT, textShadow: `0 0 22px rgba(${ACCENT_RGB},0.4)` } : {}),
            }}
          >{word}</motion.span>
        );
      })}
    </span>
  );
}

function FadeTop({ h = 200 }) {
  return <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: h, background: 'linear-gradient(to bottom, black, transparent)', zIndex: 2, pointerEvents: 'none' }} />;
}
function FadeBottom({ h = 200 }) {
  return <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: h, background: 'linear-gradient(to top, black, transparent)', zIndex: 2, pointerEvents: 'none' }} />;
}

/* ── Footer ── */
function FooterBar({ setPage }) {
  const navLinks = [
    { id: 'home',      label: 'Home' },
    { id: 'functions', label: 'Functions' },
    { id: 'pricing',   label: 'Pricing' },
  ];
  const colHead = { fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, fontSize: '0.6rem', color: `rgba(${ACCENT_RGB},0.55)`, letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 18 };
  return (
    <footer style={{ borderTop: `1px solid rgba(${ACCENT_RGB},0.14)`, paddingTop: 56, marginTop: 60, position: 'relative' }}>
      <div style={{ display: 'flex', gap: 60, flexWrap: 'wrap', marginBottom: 48 }}>
        <div style={{ flex: '1 1 220px' }}>
          <div style={{ cursor: 'pointer', marginBottom: 16 }} onClick={() => setPage('home')}>
            <Wordmark size="0.92rem" glow={false} />
          </div>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: 'rgba(255,255,255,0.32)', lineHeight: 1.65, maxWidth: 210 }}>
            AI-powered Telegram neuro-commenting. Real accounts, real growth.
          </p>
        </div>
        <div style={{ flex: '0 0 auto' }}>
          <h5 style={colHead}>Navigation</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {navLinks.map(link => (
              <span key={link.id} onClick={() => setPage(link.id)}
                style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.48)', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = ACCENT}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.48)'}
              >{link.label}</span>
            ))}
          </div>
        </div>
        <div style={{ flex: '0 0 auto' }}>
          <h5 style={colHead}>Legal</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[['privacy','Privacy Policy'],['terms','Terms of Service']].map(([id, label]) => (
              <span key={id} onClick={() => setPage(id)}
                style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.38)', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = ACCENT}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.38)'}
              >{label}</span>
            ))}
          </div>
        </div>
        <div style={{ flex: '0 0 auto' }}>
          <h5 style={colHead}>Contact</h5>
          <a href="mailto:hello@atreoxai.com" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 400, fontSize: '0.76rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', display: 'block', marginBottom: 8 }}>hello@atreoxai.com</a>
          <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.78rem', color: 'rgba(255,255,255,0.25)' }}>Mon–Fri, 9 AM–6 PM UTC</span>
        </div>
      </div>
      <div style={{ borderTop: `1px solid rgba(${ACCENT_RGB},0.08)`, paddingTop: 22, paddingBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 400, fontSize: '0.64rem', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.24)' }}>© 2026 ATREOX AI. All rights reserved.</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 400, fontSize: '0.64rem', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.24)', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: ACCENT, display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} />
          Built for Telegram growth teams worldwide
        </span>
      </div>
    </footer>
  );
}

/* ── Background color system ── */
function BgColorSystem({ page }) {
  useEffect(() => {
    if (typeof window.__bgRefresh === 'function') window.__bgRefresh();
  }, [page]);
  return null;
}

Object.assign(window, {
  ACCENT, ACCENT_RGB,
  motion, AnimatePresence, useInView,
  ArrowUpRight, Play, Zap, Palette, BarChart3, Shield, Check, Star,
  ChevronRight, ChevronDown, Users, BookOpen, GitBranch, Code2, Cpu,
  Layers, Server, Globe, Brain, Award, Clock, MessageSquare,
  TrendingUp, Sparkles, Network, Workflow, MonitorPlay, X, Menu, Info,
  Wordmark, Navbar, BlurText, FadeTop, FadeBottom,
  SectionBadge, SectionHeading, GlassBtn, FooterBar, BgColorSystem,
});
