
const React = window.React;
const { useState, useEffect, useRef } = React;
const { motion, AnimatePresence, useInView } = window.FramerMotion;

const DASHBOARD_URL = 'https://app.atreoxai.com';

/* ── Brand accent — single source of truth, read via window.ACCENT / window.ACCENT_RGB elsewhere ── */
const ACCENT = '#00d9ff';
const ACCENT_RGB = '0,217,255';

const REDUCED_MOTION = window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  Ban: "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM4.9 4.9l14.2 14.2",
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

/* ── Brand glyphs ──────────────────────────────────────────────────
   Kept out of _ip/_icon on purpose: those are 1.75-weight stroked
   outlines on a shared 24px grid, and a logo drawn that way stops
   looking like the logo. These are solid single-path marks with no
   stroke, so they read correctly at 16px in the navbar. ─────────── */
function _brandIcon(d) {
  return function BrandIcon({ size = 16, color = 'currentColor', style, title, ...rest }) {
    return React.createElement('svg', {
      width: size, height: size, viewBox: '0 0 24 24',
      fill: color, stroke: 'none', role: title ? 'img' : 'presentation',
      'aria-hidden': title ? undefined : 'true',
      style: { display: 'inline-block', flexShrink: 0, ...style }, ...rest,
    }, title ? React.createElement('title', null, title) : null,
       React.createElement('path', { d }));
  };
}

const TelegramIcon = _brandIcon(
  "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212-.07-.062-.174-.041-.249-.024-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
);

const YouTubeIcon = _brandIcon(
  "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
);

/* The two places to follow ATREOX. One list, used by the navbar, the
   footer and the home block, so a changed URL is changed once. */
const SOCIAL_LINKS = [
  { key: 'telegram', label: 'Telegram', icon: TelegramIcon,
    href: 'https://t.me/+YfEU_fmwGJlmOGZi',
    blurb: 'Release notes, new modules, and answers to questions people actually ask.' },
  { key: 'youtube', label: 'YouTube', icon: YouTubeIcon,
    href: 'https://www.youtube.com/@atreoxai',
    blurb: 'Walkthroughs of the panel — setup, module by module, start to finish.' },
];

/* Icon row. `compact` is the navbar/footer treatment; the home block
   builds its own cards from SOCIAL_LINKS instead. */
function SocialLinks({ size = 16, gap = 6 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap }}>
      {SOCIAL_LINKS.map(({ key, label, icon: Icon, href }) => (
        <a key={key} href={href} target="_blank" rel="noopener noreferrer"
          aria-label={label} title={label} className="social-dot">
          <Icon size={size} />
        </a>
      ))}
    </div>
  );
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
const Ban           = _icon('Ban');

/* ── LogoMark: the slashed-A brand mark (transparent twin of the favicon).
   viewBox is cropped to the glyph so it sits tight beside the wordmark. ── */
function LogoMark({ height = 24 }) {
  return (
    <svg viewBox="0 88 512 328" height={height} width={Math.round(height * 512 / 328)}
      aria-hidden="true" style={{ display: 'block', flexShrink: 0 }}>
      <defs>
        <linearGradient id="lm-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5ee5ff"/>
          <stop offset="1" stopColor="#00c8ee"/>
        </linearGradient>
        <linearGradient id="lm-b" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4adcff"/>
          <stop offset="0.5" stopColor="#d6f9ff"/>
          <stop offset="1" stopColor="#4adcff"/>
        </linearGradient>
        <filter id="lm-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="9" floodColor="#00d9ff" floodOpacity="0.5"/>
        </filter>
        <mask id="lm-slice">
          <rect width="512" height="512" fill="white"/>
          <path d="M 18 314 C 170 283, 340 242, 496 216" stroke="black" strokeWidth="46" fill="none" strokeLinecap="round"/>
        </mask>
      </defs>
      <g filter="url(#lm-glow)">
        <g mask="url(#lm-slice)" fill="url(#lm-a)" fillRule="evenodd">
          <path d="M 243 104 L 263 104
                   L 394.1 386 L 410 394 L 410 400 L 332 400 L 332 394 L 348.1 386
                   L 328.6 344 L 160.8 344 L 141.8 386
                   L 158 394 L 158 400 L 98 400 L 98 394 L 115.8 386 Z
                   M 243 161 L 316.5 318 L 172.5 318 Z"/>
        </g>
        <path fill="url(#lm-b)" d="M 18 314 C 170 283, 340 242, 496 216 C 344 254, 172 302, 18 314 Z"/>
      </g>
    </svg>
  );
}

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

/* ── TypeText: terminal typewriter reveal, char by char ── */
function TypeText({ text, speed = 32, startDelay = 400, style }) {
  const [n, setN] = useState(REDUCED_MOTION ? text.length : 0);
  useEffect(() => {
    if (REDUCED_MOTION) return;
    let iv;
    const t = setTimeout(() => {
      iv = setInterval(() => setN(c => {
        if (c >= text.length) { clearInterval(iv); return c; }
        return c + 1;
      }), speed);
    }, startDelay);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, []);
  return <span style={style}>{text.slice(0, n)}</span>;
}

/* ── tiltHandlers: 3D perspective tilt following the cursor.
   Mutates el.style.transform directly (no re-render); `lift` preserves any
   CSS :hover translateY the element would otherwise get. Safe on elements
   whose React style has no transform of its own. ── */
function tiltHandlers(max = 5, lift = 0) {
  if (REDUCED_MOTION) return {};
  return {
    onMouseMove: e => {
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform =
        `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(${lift}px)`;
    },
    onMouseLeave: e => { e.currentTarget.style.transform = ''; },
  };
}
/* ── magneticHandlers: the element leans a few px toward the cursor and
   snaps home when it leaves. Same contract as tiltHandlers: mutates
   style.transform directly (no re-render), so keep it off elements whose
   React style sets a transform of its own. ── */
function magneticHandlers(max = 4) {
  if (REDUCED_MOTION) return {};
  return {
    onMouseMove: e => {
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const py = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      el.style.transform = `translate(${(px * max).toFixed(1)}px, ${(py * max).toFixed(1)}px)`;
    },
    onMouseLeave: e => { e.currentTarget.style.transform = ''; },
  };
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
  const progRef = useRef(null);

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

  /* scroll-progress hairline — ref-driven so scrolling never re-renders the nav */
  useEffect(() => {
    let raf = 0;
    const upd = () => {
      raf = 0;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      if (progRef.current) {
        progRef.current.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
      }
    };
    const req = () => { if (!raf) raf = requestAnimationFrame(upd); };
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req, { passive: true });
    upd();
    return () => {
      window.removeEventListener('scroll', req);
      window.removeEventListener('resize', req);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const links = [
    { id: 'home',      label: 'Home' },
    { id: 'functions', label: 'Functions' },
    { id: 'pricing',   label: 'Pricing' },
    { id: 'guides',    label: 'Guides' },
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
        {/* Wordmark alone, then the version marker — the slashed-A mark
            next to the word made the lockup double-say the name, so up
            here the word carries it by itself (the mark lives on as the
            favicon). The marker sits outside the
            click target on purpose: inside, it would take the pointer
            cursor and read as part of the home link rather than as a
            quiet statement of which version this is. */}
        <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div onClick={() => handleNav('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Wordmark />
          </div>
          <span style={{
            fontFamily: "'Marcellus', 'Playfair Display', Georgia, serif",
            fontWeight: 400, fontSize: '0.7rem', lineHeight: 1,
            letterSpacing: '0.08em', color: `rgba(${ACCENT_RGB},0.6)`,
            userSelect: 'none', flexShrink: 0,
          }}>
            v1.0
          </span>
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
          <div style={{ flex: '1 1 0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 14 }}>
            <SocialLinks size={16} />
            <span aria-hidden="true" style={{ width: 1, height: 18, background: `rgba(${ACCENT_RGB},0.16)` }} />
            <a href={window.withReferral(DASHBOARD_URL)} target="_self" className="btn-solid btn-glitch" style={{ padding: '10px 20px', fontSize: '0.7rem' }}>
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

        {/* Scroll-progress hairline */}
        <div ref={progRef} aria-hidden="true" style={{
          position: 'absolute', left: 0, bottom: -1, height: 1, width: '0%',
          background: `linear-gradient(90deg, rgba(${ACCENT_RGB},0.85), var(--g-bright))`,
          boxShadow: `0 0 10px rgba(${ACCENT_RGB},0.55)`,
          pointerEvents: 'none',
        }} />
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
          {/* Named rather than icon-only here: a 20px glyph in a full-screen
              menu reads as decoration, and there's room for the word. */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            {SOCIAL_LINKS.map(({ key, label, icon: Icon, href }) => (
              <a key={key} href={href} target="_blank" rel="noopener noreferrer"
                className="btn-outline"
                style={{ flex: 1, justifyContent: 'center', padding: '13px', fontSize: '0.72rem', gap: 8 }}>
                <Icon size={15} /> {label}
              </a>
            ))}
          </div>
          <a href={window.withReferral(DASHBOARD_URL)} target="_self" className="btn-solid" style={{ width: '100%', justifyContent: 'center', padding: '17px', fontSize: '0.82rem' }}>
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
            className={isGlow ? 'glow-word' : undefined}
            initial={{ filter: 'blur(12px)', opacity: 0, y: 48 }}
            animate={isInView ? { filter: 'blur(0px)', opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: i * delay / 1000 }}
            style={{ display: 'inline-block', marginRight: '0.28em' }}
          >{word}</motion.span>
        );
      })}
    </span>
  );
}

/* ── DecryptText: the headline resolves out of glyph noise, left to
   right. The hacker cut of BlurText — same trigger (inView, once) and
   the same word markup once settled, so glowWords land exactly as they
   do there. Characters that haven't been reached yet churn through
   GLYPHS in the accent colour at low opacity; the real text arrives at
   an uneven pace, which is what makes it read as decoding rather than
   as a wipe. REDUCED_MOTION renders the plain words and nothing moves. ── */
const DECRYPT_GLYPHS = '#$%&@!?<>[]{}=+*/10';
function DecryptText({ text, style, glowWords = [], speed = 26, startDelay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [revealed, setRevealed] = useState(REDUCED_MOTION ? text.length : 0);
  const [, setTick] = useState(0);  /* re-randomises the noise each step */

  /* No observer, no trigger — and unlike BlurText, whose failure mode
     was an invisible line, this one's would be a headline of permanent
     garbage. Where IntersectionObserver doesn't exist the run starts
     unconditionally. */
  const go = isInView || !window.IntersectionObserver;

  useEffect(() => {
    if (!go || REDUCED_MOTION) return;
    let n = 0, iv;
    const t = setTimeout(() => {
      iv = setInterval(() => {
        n += 1 + Math.floor(Math.random() * 2);
        if (n >= text.length) { n = text.length; clearInterval(iv); }
        setRevealed(n);
        setTick(x => x + 1);
      }, speed);
    }, startDelay);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, [go]);

  const glowSet = new Set(glowWords);
  const words = [];
  let pos = 0;
  for (const word of text.split(' ')) {
    const isGlow = glowSet.has(word.replace(/[.,!?]+$/, ''));
    if (pos + word.length <= revealed) {
      words.push(
        <span key={pos} className={isGlow ? 'glow-word' : undefined}
          style={{ display: 'inline-block', marginRight: '0.28em' }}>{word}</span>
      );
    } else {
      const cut = Math.max(0, revealed - pos);
      const noise = word.slice(cut).replace(/./g, () =>
        DECRYPT_GLYPHS[Math.floor(Math.random() * DECRYPT_GLYPHS.length)]);
      words.push(
        <span key={pos} style={{ display: 'inline-block', marginRight: '0.28em' }}>
          {word.slice(0, cut)}
          <span style={{ color: `rgba(${ACCENT_RGB},0.5)` }}>{noise}</span>
        </span>
      );
    }
    pos += word.length + 1;
  }

  /* The noise is meaningless to a screen reader, so the real sentence
     rides along visually hidden and the churn is aria-hidden. */
  return (
    <span ref={ref} style={style}>
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>{text}</span>
      <span aria-hidden="true">{words}</span>
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
    { id: 'guides',    label: 'Guides' },
  ];
  const colHead = { fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, fontSize: '0.6rem', color: `rgba(${ACCENT_RGB},0.55)`, letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 18 };
  return (
    <footer style={{ borderTop: `1px solid rgba(${ACCENT_RGB},0.14)`, paddingTop: 56, marginTop: 60, position: 'relative' }}>
      <div style={{ display: 'flex', gap: 60, flexWrap: 'wrap', marginBottom: 48 }}>
        <div style={{ flex: '1 1 220px' }}>
          <div style={{ cursor: 'pointer', marginBottom: 16 }} onClick={() => setPage('home')}>
            <Wordmark size="0.92rem" glow={false} />
          </div>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.84rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, maxWidth: 210 }}>
            AI-powered Telegram neuro-commenting. Real accounts, real growth.
          </p>
        </div>
        <div style={{ flex: '0 0 auto' }}>
          <h5 style={colHead}>Navigation</h5>
          <div className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {navLinks.map(link => (
              <span key={link.id} onClick={() => setPage(link.id)}
                style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = ACCENT}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
              >{link.label}</span>
            ))}
          </div>
        </div>
        <div style={{ flex: '0 0 auto' }}>
          <h5 style={colHead}>Legal</h5>
          <div className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[['referral','Referral Program'],['privacy','Privacy Policy'],['terms','Terms of Service']].map(([id, label]) => (
              <span key={id} onClick={() => setPage(id)}
                style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.88rem', color: 'rgba(255,255,255,0.52)', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = ACCENT}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.52)'}
              >{label}</span>
            ))}
          </div>
        </div>
        <div style={{ flex: '0 0 auto' }}>
          <h5 style={colHead}>Contact</h5>
          <span className="footer-link" onClick={() => setPage('contact')}
            style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'block', marginBottom: 10, transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = ACCENT}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
          >Contact form</span>
          <a href="mailto:hello@atreoxai.com" className="footer-link" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 400, fontSize: '0.8rem', color: 'rgba(255,255,255,0.62)', textDecoration: 'none', display: 'block', marginBottom: 10 }}>hello@atreoxai.com</a>
          <span style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: `rgba(${ACCENT_RGB},0.7)`, marginBottom: 5 }}>Mon–Fri · 08:00–20:00 CET</span>
          <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Weekend messages are answered Monday</span>
        </div>
        <div style={{ flex: '0 0 auto' }}>
          <h5 style={colHead}>Follow</h5>
          <div className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SOCIAL_LINKS.map(({ key, label, icon: Icon, href }) => (
              <a key={key} href={href} target="_blank" rel="noopener noreferrer"
                className="footer-social"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
                <Icon size={15} /> {label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div style={{ borderTop: `1px solid rgba(${ACCENT_RGB},0.08)`, paddingTop: 22, paddingBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 400, fontSize: '0.68rem', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.4)' }}>© 2026 ATREOX AI. All rights reserved.</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 400, fontSize: '0.68rem', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.4)', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: ACCENT, display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} />
          Built for Telegram growth teams worldwide
        </span>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Page-level primitives shared by Functions / Guides / Pricing.
   They used to live in new-pages.jsx; three pages now use them, so
   they belong next to the Navbar and Footer instead.
══════════════════════════════════════════════════════════════════ */
const MONO  = "'JetBrains Mono', monospace";
const SERIF = "'Playfair Display', Georgia, serif";

/* ─── inner-page hero ─── */
function PageHero({ badge, title, sub }) {
  return (
    <section style={{ paddingTop: 170, paddingBottom: 84, paddingLeft: '5%', paddingRight: '5%', textAlign: 'center', borderBottom: `1px solid rgba(${ACCENT_RGB},0.12)` }}>
      <SectionBadge>{badge}</SectionBadge>
      <DecryptText text={title} style={{
        display: 'block',
        fontFamily: SERIF, fontWeight: 500,
        fontSize: 'clamp(2.5rem, 4.6vw, 4rem)', color: 'white',
        lineHeight: 1.08, letterSpacing: '-0.015em', marginTop: 22, marginBottom: 20
      }} />
      <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1.02rem', color: 'rgba(255,255,255,0.66)', maxWidth: 640, margin: '0 auto', lineHeight: 1.7 }}>
        {sub}
      </p>
    </section>
  );
}

/* ─── section wrapper: rises into view once ─── */
function PageSection({ children, style, id }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.05 });
  return (
    <div ref={ref} id={id} style={id ? { scrollMarginTop: 88 } : undefined}>
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

/* ─── Section lockup: cyan // glyph, serif title, hairline to the edge ─── */
function SectionLockup({ title, children, style }) {
  return (
    <div style={{ marginBottom: 34, ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <span aria-hidden="true" style={{ fontFamily: MONO, fontWeight: 600, fontSize: '1rem', lineHeight: 1, color: ACCENT, userSelect: 'none' }}>//</span>
        <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', color: 'white', letterSpacing: '-0.01em', lineHeight: 1 }}>
          <DecryptText text={title} />
        </h2>
        <div aria-hidden="true" className="section-rule" style={{ flex: '1 1 32px', minWidth: 32 }} />
      </div>
      {children && (
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.97rem', color: 'rgba(255,255,255,0.64)', lineHeight: 1.7, maxWidth: 660, marginTop: 14 }}>
          {children}
        </p>
      )}
    </div>
  );
}

/* ─── Sharp-cornered marker pill, same lockup language as the v1.0 chip ─── */
function Pill({ children, dot, muted }) {
  const c = muted ? 'rgba(255,255,255,0.42)' : ACCENT;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
      border: `1px solid ${muted ? 'rgba(255,255,255,0.18)' : `rgba(${ACCENT_RGB},0.35)`}`,
      background: muted ? 'rgba(255,255,255,0.04)' : `rgba(${ACCENT_RGB},0.08)`,
      borderRadius: 3, padding: '4px 9px',
      boxShadow: muted ? 'none' : `0 0 10px rgba(${ACCENT_RGB},0.12)`,
      fontFamily: MONO, fontWeight: 600, fontSize: '0.58rem', lineHeight: 1,
      letterSpacing: '0.16em', textTransform: 'uppercase', color: c,
    }}>
      {dot && <span aria-hidden="true" style={{ width: 4, height: 4, background: c, boxShadow: muted ? 'none' : `0 0 6px rgba(${ACCENT_RGB},0.8)` }} />}
      {children}
    </span>
  );
}

/* ─── CrossLinks: the rail at the foot of every page.
   Functions sells, Guides teaches, Pricing closes — whichever two the
   visitor isn't currently on are always one click away, so moving
   between them never costs a trip back to the navbar. ─── */
const CROSS_DESTS = {
  functions: { label: 'Functions', head: 'What each module does',
    body: 'Eight modules, one section each — the problem it solves, how it runs, and every setting you get.' },
  guides:    { label: 'Guides',    head: 'How to set it up',
    body: 'Buying accounts, wiring proxies, and a walkthrough per module — video guides as they are recorded.' },
  pricing:   { label: 'Pricing',   head: 'What it costs',
    body: 'Take the modules you need or the whole licence. Account Manager and Profile Templates come with either.' },
};

function CrossLinks({ current, setPage }) {
  const dests = Object.keys(CROSS_DESTS).filter(k => k !== current);
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 5%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        {dests.map(k => {
          const d = CROSS_DESTS[k];
          return (
            <button key={k} type="button" onClick={() => setPage(k)}
              className="panel panel-hover ticks"
              style={{
                padding: '30px 28px', textAlign: 'left', width: '100%',
                display: 'flex', flexDirection: 'column', gap: 10, background: 'transparent',
              }}>
              <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.6rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: `rgba(${ACCENT_RGB},0.7)` }}>
                {'// '}{d.label}
              </span>
              <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '1.35rem', color: 'white', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                {d.head}
              </span>
              <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.86rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
                {d.body}
              </span>
              <span style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: MONO, fontWeight: 500, fontSize: '0.62rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: ACCENT }}>
                Open <ArrowUpRight size={13} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
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
  ACCENT, ACCENT_RGB, REDUCED_MOTION,
  TypeText, tiltHandlers, magneticHandlers, DecryptText,
  motion, AnimatePresence, useInView,
  ArrowUpRight, Play, Zap, Palette, BarChart3, Shield, Check, Star,
  ChevronRight, ChevronDown, Users, BookOpen, GitBranch, Code2, Cpu,
  Layers, Server, Globe, Brain, Award, Clock, MessageSquare,
  TrendingUp, Sparkles, Network, Workflow, MonitorPlay, X, Menu, Info,
  LogoMark, Wordmark, Navbar, BlurText, FadeTop, FadeBottom,
  SectionBadge, SectionHeading, GlassBtn, FooterBar, BgColorSystem,
  MONO, SERIF, PageHero, PageSection, SectionLockup, Pill, CrossLinks,
  TelegramIcon, YouTubeIcon, SOCIAL_LINKS, SocialLinks, Ban,
});
