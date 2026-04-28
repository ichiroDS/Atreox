
const React = window.React;
const { useState, useEffect, useRef } = React;
const { motion, AnimatePresence, useInView } = window.FramerMotion;

/* ── Auth ── */
const _AU = 'atreox_users_v1', _AC = 'atreox_cur_v1';
function getUsers() { try { return JSON.parse(localStorage.getItem(_AU)||'[]'); } catch{return[];} }
function getCurrentUser() { try { return JSON.parse(localStorage.getItem(_AC)||'null'); } catch{return null;} }
function registerUser({name, email, password}) {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
    return { ok: false, error: 'An account with this email already exists.' };
  const user = { name, email };
  localStorage.setItem(_AU, JSON.stringify([...users, { name, email, password }]));
  localStorage.setItem(_AC, JSON.stringify(user));
  return { ok: true, user };
}
function loginUser({email, password}) {
  const found = getUsers().find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!found) return { ok: false, error: 'Invalid email or password.' };
  const user = { name: found.name, email: found.email };
  localStorage.setItem(_AC, JSON.stringify(user));
  return { ok: true, user };
}
function loginWithProvider(provider, name, email) {
  const users = getUsers();
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    const user = { name: existing.name, email: existing.email };
    localStorage.setItem(_AC, JSON.stringify(user));
    return { ok: true, user };
  }
  const user = { name, email };
  localStorage.setItem(_AU, JSON.stringify([...users, { name, email, provider }]));
  localStorage.setItem(_AC, JSON.stringify(user));
  return { ok: true, user };
}
function logoutUser() { localStorage.removeItem(_AC); }

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
  Lock: "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4",
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
  CreditCard: "M1 4h22v16H1zM1 10h22",
  User: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  Mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
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
const Lock          = _icon('Lock');
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
const CreditCard    = _icon('CreditCard');
const UserIcon      = _icon('User');
const MailIcon2     = _icon('Mail');

/* ── Helpers ── */
function SectionBadge({ children }) {
  return (
    <span className="liquid-glass" style={{
      borderRadius: 9999, padding: '4px 14px', fontSize: '0.72rem',
      fontFamily: 'Barlow, sans-serif', fontWeight: 500, color: 'white',
      display: 'inline-block', letterSpacing: '0.06em', textTransform: 'uppercase'
    }}>{children}</span>
  );
}
function SectionHeading({ children, style }) {
  return (
    <h2 style={{
      fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
      fontSize: 'clamp(2.4rem, 5vw, 4rem)', color: 'white',
      letterSpacing: '-0.02em', lineHeight: 0.9, ...style
    }}>{children}</h2>
  );
}
function GlassBtn({ children, onClick, white, style }) {
  if (white) return (
    <button className="btn-white-glow" onClick={onClick} style={{
      background: 'white', color: 'black', border: 'none', borderRadius: 9999,
      padding: '10px 24px', fontFamily: 'Barlow, sans-serif', fontWeight: 500,
      fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: 6,
      cursor: 'pointer', ...style
    }}>{children}</button>
  );
  return (
    <button className="liquid-glass-strong btn-glass-hover" onClick={onClick} style={{
      borderRadius: 9999, padding: '10px 24px', border: 'none', color: 'white',
      fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.875rem',
      display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
      background: 'rgba(255,255,255,0.08)', ...style
    }}>{children}</button>
  );
}

/* ── Input row helper ── */
function FieldWrap({ children }) {
  return (
    <div className="liquid-glass glass-field" style={{ borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
      {children}
    </div>
  );
}

/* ── Navbar ── */
function Navbar({ currentPage, setPage, user, onLoginClick, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const userMenuRef = useRef(null);

  const cartCount = (() => {
    try {
      const c = JSON.parse(localStorage.getItem('atreox_cart_v1') || 'null');
      return c ? 1 : 0;
    } catch { return 0; }
  })();

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  const links = [
    { id: 'home',         label: 'Home' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'pricing',      label: 'Pricing' },
    { id: 'contact',      label: 'Contact' },
  ];

  const handleNav = (id) => { setPage(id); setMenuOpen(false); };

  return (
    <>
      <nav style={{ position: 'fixed', top: 16, left: 0, right: 0, zIndex: 100, padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Logo */}
        <div onClick={() => handleNav('meet')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flex: '1 1 0', minWidth: 0 }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="9" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
            <polygon points="18,7 29,14 29,26 18,29 7,22 7,10" fill="none" stroke="white" strokeWidth="1.5"/>
            <circle cx="18" cy="18" r="3" fill="white" opacity="0.9"/>
          </svg>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.15rem', color: 'white', whiteSpace: 'nowrap' }}>ATREOX AI</span>
        </div>

        {/* Desktop nav pills */}
        {!isMobile && (
          <div className="liquid-glass" style={{ borderRadius: 9999, padding: '4px 6px', display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
            {links.map(link => (
              <button key={link.id} className="nav-pill-btn" onClick={() => handleNav(link.id)} style={{
                padding: '7px 16px', borderRadius: 9999, border: 'none',
                background: currentPage === link.id ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: currentPage === link.id ? 'white' : 'rgba(255,255,255,0.6)',
                fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.82rem', cursor: 'pointer',
              }}>{link.label}</button>
            ))}
          </div>
        )}

        {/* Desktop auth */}
        {!isMobile && (
          <div style={{ flex: '1 1 0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
            {user ? (
              <>
                {/* Cart icon */}
                <button className="liquid-glass btn-glass-hover" onClick={() => setPage('checkout')} style={{ position: 'relative', width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.99-1.72l1.38-9.28H6"/>
                  </svg>
                  {cartCount > 0 && (
                    <div style={{ position: 'absolute', top: -3, right: -3, width: 14, height: 14, borderRadius: '50%', background: '#e879f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: '0.55rem', color: 'white' }}>{cartCount}</span>
                    </div>
                  )}
                </button>

                {/* User dropdown trigger */}
                <div ref={userMenuRef} style={{ position: 'relative' }}>
                  <button className="liquid-glass btn-glass-hover" onClick={() => setUserMenuOpen(o => !o)} style={{ borderRadius: 9999, padding: '7px 14px', border: 'none', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'rgba(255,255,255,0.06)' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#4f8ef7,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.65rem', color: 'white' }}>{user.name[0].toUpperCase()}</span>
                    </div>
                    <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
                    <ChevronDown size={12} color="rgba(255,255,255,0.4)" style={{ transition: 'transform 0.2s', transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div className="liquid-glass-strong" style={{ position: 'absolute', top: '100%', right: 0, minWidth: 160, borderRadius: '0 0 14px 14px', padding: '4px 6px 6px', border: '1px solid rgba(255,255,255,0.1)', borderTop: 'none', zIndex: 200, background: 'rgba(14,12,24,0.97)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', boxShadow: '0 16px 48px rgba(0,0,0,0.55)', animation: 'dropdown-in 0.18s cubic-bezier(0.16,1,0.3,1) both' }}>
                      <button onClick={() => { setUserMenuOpen(false); setPage('settings'); }} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 9, border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.8)', fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                        Settings
                      </button>
                      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '4px 10px' }} />
                      <button onClick={() => { setUserMenuOpen(false); onLogout(); }} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 9, border: 'none', background: 'transparent', color: 'rgba(248,113,113,0.85)', fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button className="liquid-glass btn-glass-hover" onClick={onLoginClick} style={{
                padding: '8px 22px', borderRadius: 9999, border: 'none', color: 'white',
                fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.82rem',
                cursor: 'pointer', background: 'rgba(255,255,255,0.08)',
              }}>Login</button>
            )}
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button onClick={() => setMenuOpen(o => !o)} className="liquid-glass"
            style={{ flexShrink: 0, background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {menuOpen ? <X size={18} color="white" /> : <Menu size={18} color="white" />}
          </button>
        )}
      </nav>

      {/* Mobile full-screen menu */}
      {isMobile && menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,0.93)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', padding: '88px 24px 40px', gap: 4 }}>
          {links.map(link => (
            <button key={link.id} onClick={() => handleNav(link.id)} style={{
              width: '100%', padding: '16px 20px', border: 'none', borderRadius: 14,
              background: currentPage === link.id ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: currentPage === link.id ? 'white' : 'rgba(255,255,255,0.6)',
              fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '1.1rem',
              cursor: 'pointer', textAlign: 'left',
            }}>{link.label}</button>
          ))}
          <div style={{ flex: 1 }} />
          {user ? (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 4px 10px' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#4f8ef7,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: 'white' }}>{user.name[0].toUpperCase()}</span>
                </div>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)' }}>{user.name}</span>
              </div>
              <button onClick={() => { handleNav('checkout'); }} style={{
                width: '100%', padding: '14px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
                background: 'transparent', color: 'rgba(255,255,255,0.6)',
                fontFamily: 'Barlow, sans-serif', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.99-1.72l1.38-9.28H6"/></svg>
                Cart{cartCount > 0 ? ` (${cartCount})` : ''}
              </button>
              <button onClick={() => { handleNav('settings'); }} style={{
                width: '100%', padding: '14px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
                background: 'transparent', color: 'rgba(255,255,255,0.6)',
                fontFamily: 'Barlow, sans-serif', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left',
              }}>Settings</button>
              <button onClick={() => { onLogout(); setMenuOpen(false); }} style={{
                width: '100%', padding: '14px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                background: 'transparent', color: 'rgba(248,113,113,0.7)',
                fontFamily: 'Barlow, sans-serif', fontSize: '0.9rem', cursor: 'pointer',
              }}>Log out</button>
            </div>
          ) : (
            <button onClick={() => { onLoginClick(); setMenuOpen(false); }} style={{
              width: '100%', padding: '16px', border: 'none', borderRadius: 14,
              background: 'rgba(255,255,255,0.08)', color: 'white',
              fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
            }}>Login</button>
          )}
        </div>
      )}
    </>
  );
}

/* ── Google Auth Popup ── */
function GoogleAuthPopup({ onSuccess, onClose }) {
  const [step, setStep] = useState('email'); // 'email' | 'name'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const inputBase = {
    width: '100%', padding: '13px 14px', borderRadius: 8,
    border: '1px solid #dadce0', outline: 'none',
    fontFamily: 'Google Sans, Roboto, sans-serif', fontSize: '1rem', color: '#202124',
    background: 'white', boxSizing: 'border-box',
  };

  const handleNext = () => {
    setError('');
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) { setError('Enter a valid email address.'); return; }
    const existing = getUsers().find(u => u.email.toLowerCase() === trimmed);
    if (existing) {
      const res = loginWithProvider('google', existing.name, trimmed);
      if (res.ok) onSuccess(res.user);
    } else {
      setStep('name');
    }
  };

  const handleCreate = () => {
    setError('');
    if (!name.trim()) { setError('Enter your name.'); return; }
    const res = loginWithProvider('google', name.trim(), email.trim().toLowerCase());
    if (res.ok) onSuccess(res.user);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 28, padding: '48px 40px 36px', width: 440, maxWidth: '90vw', boxShadow: '0 4px 30px rgba(0,0,0,0.25)', position: 'relative' }}
        onClick={e => e.stopPropagation()}>
        {/* Google logo */}
        <svg width="75" height="24" viewBox="0 0 272 92" style={{ marginBottom: 24 }}>
          <path fill="#EA4335" d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
          <path fill="#FBBC05" d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
          <path fill="#4285F4" d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.67-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.26zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"/>
          <path fill="#34A853" d="M225 3v65h-9.5V3h9.5z"/>
          <path fill="#EA4335" d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"/>
          <path fill="#4285F4" d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"/>
        </svg>

        {step === 'email' ? (
          <>
            <h2 style={{ fontFamily: 'Google Sans, Roboto, sans-serif', fontWeight: 400, fontSize: '1.5rem', color: '#202124', marginBottom: 8 }}>Sign in</h2>
            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '0.95rem', color: '#444746', marginBottom: 28 }}>to continue to <strong>ATREOX AI</strong></p>
            <input autoFocus type="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNext()}
              placeholder="Email or phone" style={inputBase} />
            {error && <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '0.8rem', color: '#d93025', marginTop: 8 }}>{error}</p>}
            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '0.875rem', color: '#1a73e8', cursor: 'pointer', margin: '18px 0 0' }}>Forgot email?</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
              <span onClick={onClose} style={{ fontFamily: 'Google Sans, sans-serif', fontSize: '0.875rem', color: '#1a73e8', cursor: 'pointer', fontWeight: 500 }}>Cancel</span>
              <button onClick={handleNext} style={{ background: '#1a73e8', color: 'white', border: 'none', borderRadius: 4, padding: '10px 24px', fontFamily: 'Google Sans, sans-serif', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer' }}>Next</button>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ fontFamily: 'Google Sans, Roboto, sans-serif', fontWeight: 400, fontSize: '1.5rem', color: '#202124', marginBottom: 8 }}>Create account</h2>
            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '0.88rem', color: '#444746', marginBottom: 24 }}>for <strong>{email}</strong></p>
            <input autoFocus type="text" value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="Your full name" style={inputBase} />
            {error && <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '0.8rem', color: '#d93025', marginTop: 8 }}>{error}</p>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
              <span onClick={() => setStep('email')} style={{ fontFamily: 'Google Sans, sans-serif', fontSize: '0.875rem', color: '#1a73e8', cursor: 'pointer', fontWeight: 500 }}>Back</span>
              <button onClick={handleCreate} style={{ background: '#1a73e8', color: 'white', border: 'none', borderRadius: 4, padding: '10px 24px', fontFamily: 'Google Sans, sans-serif', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer' }}>Continue</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Apple Auth Popup ── */
function AppleAuthPopup({ onSuccess, onClose }) {
  const [appleId, setAppleId] = useState('');
  const [applePass, setApplePass] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState('creds'); // 'creds' | 'name'
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const inputBase = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.15)', outline: 'none',
    fontFamily: '-apple-system, SF Pro Text, sans-serif', fontSize: '0.95rem',
    color: 'white', background: 'rgba(255,255,255,0.1)',
    boxSizing: 'border-box',
  };

  const handleSignIn = () => {
    setError('');
    const trimmed = appleId.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) { setError('Enter a valid Apple ID (email).'); return; }
    if (!applePass) { setError('Enter your password.'); return; }
    const existing = getUsers().find(u => u.email.toLowerCase() === trimmed);
    if (existing) {
      const res = loginWithProvider('apple', existing.name, trimmed);
      if (res.ok) onSuccess(res.user);
    } else {
      setStep('name');
    }
  };

  const handleCreate = () => {
    setError('');
    if (!name.trim()) { setError('Enter your name.'); return; }
    const res = loginWithProvider('apple', name.trim(), appleId.trim().toLowerCase());
    if (res.ok) onSuccess(res.user);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      onClick={onClose}>
      <div style={{ background: 'rgba(28,28,30,0.96)', borderRadius: 20, padding: '44px 36px 36px', width: 400, maxWidth: '90vw', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}
        onClick={e => e.stopPropagation()}>
        {/* Apple logo */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <svg width="36" height="44" viewBox="0 0 814 1000" fill="white">
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.7-155.5-127.4C46.7 790.7 0 663 0 541.8c0-207.5 135.4-317.1 269-317.1 70.6 0 129.5 46.4 174.4 46.4 43 0 110.1-50.7 194.3-50.7zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
          </svg>
        </div>

        {step === 'creds' ? (
          <>
            <h2 style={{ fontFamily: '-apple-system, SF Pro Display, sans-serif', fontWeight: 600, fontSize: '1.35rem', color: 'white', textAlign: 'center', marginBottom: 6 }}>Sign in with Apple ID</h2>
            <p style={{ fontFamily: '-apple-system, SF Pro Text, sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginBottom: 28, lineHeight: 1.5 }}>
              Use your Apple ID to sign in to ATREOX AI.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input autoFocus type="email" value={appleId} onChange={e => setAppleId(e.target.value)}
                placeholder="Apple ID" style={inputBase} />
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={applePass} onChange={e => setApplePass(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                  placeholder="Password" style={inputBase} />
                <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontFamily: '-apple-system, sans-serif', fontSize: '0.75rem' }}>
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            {error && <p style={{ fontFamily: '-apple-system, sans-serif', fontSize: '0.78rem', color: '#ff453a', marginTop: 8, textAlign: 'center' }}>{error}</p>}
            <p style={{ fontFamily: '-apple-system, sans-serif', fontSize: '0.8rem', color: '#0a84ff', textAlign: 'center', cursor: 'pointer', margin: '14px 0 20px' }}>Forgot Apple ID or password?</p>
            <button onClick={handleSignIn} style={{ width: '100%', background: '#0a84ff', color: 'white', border: 'none', borderRadius: 10, padding: '13px', fontFamily: '-apple-system, SF Pro Text, sans-serif', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}>
              Sign In
            </button>
            <button onClick={onClose} style={{ width: '100%', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 10, padding: '13px', fontFamily: '-apple-system, SF Pro Text, sans-serif', fontWeight: 400, fontSize: '0.95rem', cursor: 'pointer', marginTop: 10 }}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <h2 style={{ fontFamily: '-apple-system, SF Pro Display, sans-serif', fontWeight: 600, fontSize: '1.35rem', color: 'white', textAlign: 'center', marginBottom: 6 }}>Your Name</h2>
            <p style={{ fontFamily: '-apple-system, SF Pro Text, sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginBottom: 24 }}>
              First time signing in as <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{appleId}</strong>
            </p>
            <input autoFocus type="text" value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="Full Name" style={inputBase} />
            {error && <p style={{ fontFamily: '-apple-system, sans-serif', fontSize: '0.78rem', color: '#ff453a', marginTop: 8, textAlign: 'center' }}>{error}</p>}
            <button onClick={handleCreate} style={{ width: '100%', background: '#0a84ff', color: 'white', border: 'none', borderRadius: 10, padding: '13px', fontFamily: '-apple-system, SF Pro Text, sans-serif', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', marginTop: 20 }}>
              Continue
            </button>
            <button onClick={() => setStep('creds')} style={{ width: '100%', background: 'transparent', color: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: 10, padding: '10px', fontFamily: '-apple-system, sans-serif', fontSize: '0.88rem', cursor: 'pointer', marginTop: 6 }}>
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Auth Modal (Login + Register) ── */
function AuthModal({ mode: initialMode = 'login', onClose, onSuccess }) {
  const [mode, setMode] = useState(initialMode);
  const [providerPopup, setProviderPopup] = useState(null); // 'google' | 'apple' | null
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    background: 'none', border: 'none', outline: 'none',
    color: 'white', fontFamily: 'Barlow, sans-serif',
    fontWeight: 300, fontSize: '0.85rem', width: '100%',
  };

  const handleSubmit = () => {
    setError('');
    if (mode === 'login') {
      if (!email || !password) { setError('Please fill in all fields.'); return; }
      const res = loginUser({ email, password });
      if (!res.ok) { setError(res.error); return; }
      onSuccess(res.user);
    } else {
      if (!name || !email || !password || !confirmPw) { setError('Please fill in all fields.'); return; }
      if (password !== confirmPw) { setError('Passwords do not match.'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      const res = registerUser({ name, email, password });
      if (!res.ok) { setError(res.error); return; }
      onSuccess(res.user);
    }
  };

  const switchMode = (m) => { setMode(m); setError(''); setEmail(''); setPassword(''); setName(''); setConfirmPw(''); };

  const EyeIcon = ({ open }) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.75">
      {open
        ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
        : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></>
      }
    </svg>
  );

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="liquid-glass-strong"
        style={{ borderRadius: 28, padding: '44px 36px', width: 380, maxWidth: '90vw', position: 'relative', background: 'rgba(10,10,10,0.95)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} className="btn-glass-hover" style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.07)', border: 'none', width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <X size={13} color="rgba(255,255,255,0.55)" />
        </button>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none" style={{ marginBottom: 10 }}>
            <rect width="36" height="36" rx="9" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
            <polygon points="18,7 29,14 29,26 18,29 7,22 7,10" fill="none" stroke="white" strokeWidth="1.5"/>
            <circle cx="18" cy="18" r="3" fill="white" opacity="0.9"/>
          </svg>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.5rem', color: 'white', marginBottom: 4 }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </div>
          <div style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', marginBottom: 28 }}>
            {mode === 'login' ? 'Sign in to your ATREOX AI account' : 'Join thousands of AI creators'}
          </div>
        </div>

        {/* Mode tabs */}
        <div className="liquid-glass" style={{ borderRadius: 12, padding: 4, display: 'flex', gap: 4, marginBottom: 24 }}>
          {[['login','Login'],['register','Create Account']].map(([m, label]) => (
            <button key={m} onClick={() => switchMode(m)} style={{
              flex: 1, padding: '9px', borderRadius: 9, border: 'none',
              background: mode === m ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: mode === m ? 'white' : 'rgba(255,255,255,0.45)',
              fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.8rem', cursor: 'pointer',
              transition: 'all 0.2s',
            }}>{label}</button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <div>
              <label style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.76rem', color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'block' }}>Full Name</label>
              <FieldWrap>
                <UserIcon size={15} color="rgba(255,255,255,0.35)" style={{ flexShrink: 0 }} />
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" style={inputStyle} />
              </FieldWrap>
            </div>
          )}
          <div>
            <label style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.76rem', color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'block' }}>Email</label>
            <FieldWrap>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.75" style={{ flexShrink: 0 }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={inputStyle} />
            </FieldWrap>
          </div>
          <div>
            <label style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.76rem', color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'block' }}>Password</label>
            <FieldWrap>
              <Lock size={15} color="rgba(255,255,255,0.35)" style={{ flexShrink: 0 }} />
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" style={{ ...inputStyle, flex: 1 }} />
              <button onClick={() => setShowPw(!showPw)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0 }}>
                <EyeIcon open={showPw} />
              </button>
            </FieldWrap>
          </div>
          {mode === 'register' && (
            <div>
              <label style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.76rem', color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'block' }}>Confirm Password</label>
              <FieldWrap>
                <Lock size={15} color="rgba(255,255,255,0.35)" style={{ flexShrink: 0 }} />
                <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat password" style={inputStyle} />
              </FieldWrap>
            </div>
          )}

          {mode === 'login' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ accentColor: 'white', width: 14, height: 14 }} />
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>Remember me</span>
              </label>
              <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>Forgot Password?</span>
            </div>
          )}

          {mode === 'register' && (
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: 'white', width: 14, height: 14, marginTop: 2 }} />
              <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.75rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.5 }}>
                I agree to the <span style={{ color: 'rgba(255,255,255,0.65)', cursor: 'pointer' }}>Terms of Service</span> and <span style={{ color: 'rgba(255,255,255,0.65)', cursor: 'pointer' }}>Privacy Policy</span>
              </span>
            </label>
          )}

          {error && (
            <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '10px 14px' }}>
              <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: '#f87171' }}>{error}</span>
            </div>
          )}

          <button className="btn-white-glow" onClick={handleSubmit} style={{
            width: '100%', padding: '14px', borderRadius: 14, border: 'none',
            background: 'rgba(255,255,255,0.92)', color: 'black',
            fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.92rem',
            cursor: 'pointer', marginTop: 4,
          }}>
            {mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </div>

        {/* Social divider (login only) */}
        {mode === 'login' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0 14px' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.72rem', color: 'rgba(255,255,255,0.28)' }}>Or continue with</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Google', key: 'google', icon: <svg width="15" height="15" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> },
                { label: 'Apple', key: 'apple', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg> },
              ].map(({ label, key, icon }) => (
                <button key={key} onClick={() => setProviderPopup(key)} className="liquid-glass btn-glass-hover" style={{ borderRadius: 12, padding: '11px', border: 'none', color: 'white', fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.83rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(255,255,255,0.06)' }}>
                  {icon}{label}
                </button>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {providerPopup === 'google' && (
        <GoogleAuthPopup
          onSuccess={u => { setProviderPopup(null); onSuccess(u); }}
          onClose={() => setProviderPopup(null)}
        />
      )}
      {providerPopup === 'apple' && (
        <AppleAuthPopup
          onSuccess={u => { setProviderPopup(null); onSuccess(u); }}
          onClose={() => setProviderPopup(null)}
        />
      )}
    </div>
  );
}

/* ── BlurText ── */
function BlurText({ text, style, delay = 120 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const words = text.split(' ');
  return (
    <span ref={ref} style={{ display: 'block', ...style }}>
      {words.map((word, i) => (
        <motion.span key={i}
          initial={{ filter: 'blur(12px)', opacity: 0, y: 48 }}
          animate={isInView ? { filter: 'blur(0px)', opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: i * delay / 1000 }}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
        >{word}</motion.span>
      ))}
    </span>
  );
}

/* ── HLSVideo ── */
function HLSVideo({ src, filterStyle }) {
  const ref = useRef(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let hls;
    (window.__hlsReady || Promise.resolve(window.Hls)).then(Hls => {
      try {
        if (Hls && Hls.isSupported()) {
          hls = new Hls({ autoStartLoad: true, enableWorker: false, debug: false });
          hls.on(Hls.Events.ERROR, (_, d) => { if (d.fatal) hls.destroy(); });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.play().catch(() => {});
        }
      } catch(e) { /* stream unavailable */ }
    }).catch(() => {});
    return () => { try { hls && hls.destroy(); } catch(e) {} };
  }, [src]);
  return (
    <video ref={ref} autoPlay loop muted playsInline
      style={{ width: '100%', height: '100%', objectFit: 'cover', filter: filterStyle, display: 'block' }} />
  );
}

function FadeTop({ h = 200 }) {
  return <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: h, background: 'linear-gradient(to bottom, black, transparent)', zIndex: 2, pointerEvents: 'none' }} />;
}
function FadeBottom({ h = 200 }) {
  return <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: h, background: 'linear-gradient(to top, black, transparent)', zIndex: 2, pointerEvents: 'none' }} />;
}

/* ── Node Workflow ── */
function NodeWorkflow() {
  const nodes = [
    { id: 'ckpt',     label: 'Load Checkpoint',    sub: 'SDXL Turbo v2',   x: 40,  y: 60,  cls: 'node-float-1', color: '#4f8ef7' },
    { id: 'clipP',    label: 'CLIP Text Encode',   sub: 'Positive prompt', x: 40,  y: 200, cls: 'node-float-2', color: '#a78bfa' },
    { id: 'clipN',    label: 'CLIP Text Encode',   sub: 'Negative prompt', x: 40,  y: 340, cls: 'node-float-3', color: '#a78bfa' },
    { id: 'latent',   label: 'Empty Latent Image', sub: '1024 × 1024',     x: 40,  y: 480, cls: 'node-float-4', color: '#34d399' },
    { id: 'ksampler', label: 'KSampler',            sub: 'DPM++ 2M · 30s', x: 380, y: 255, cls: 'node-float-5', color: '#f59e0b' },
    { id: 'vae',      label: 'VAE Decode',          sub: 'sdxl-vae-fp16',  x: 650, y: 255, cls: 'node-float-6', color: '#f87171' },
    { id: 'save',     label: 'Image Output',        sub: 'Preview / Save', x: 890, y: 255, cls: 'node-float-7', color: '#6ee7b7' },
  ];
  const NW = 165, NH = 64;
  const cx = n => n.x + NW / 2, cy = n => n.y + NH / 2;
  const byId = id => nodes.find(n => n.id === id);
  const edges = [
    { from:'ckpt', to:'ksampler', label:'model' },
    { from:'clipP', to:'ksampler', label:'positive' },
    { from:'clipN', to:'ksampler', label:'negative' },
    { from:'latent', to:'ksampler', label:'latent' },
    { from:'ksampler', to:'vae', label:'latent' },
    { from:'vae', to:'save', label:'image' },
  ];
  const bezier = (a, b) => {
    const x1=cx(a),y1=cy(a),x2=cx(b),y2=cy(b),ctrl=(x2-x1)*0.5;
    return `M ${x1} ${y1} C ${x1+ctrl} ${y1} ${x2-ctrl} ${y2} ${x2} ${y2}`;
  };
  const W=1080, H=580;
  return (
    <div style={{ position:'relative', width:'100%', overflowX:'auto' }}>
      <div style={{ position:'relative', width:W, height:H, margin:'0 auto' }}>
        <svg width={W} height={H} style={{ position:'absolute', inset:0 }}>
          <defs><pattern id="nodeGrid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
          </pattern></defs>
          <rect width={W} height={H} fill="url(#nodeGrid)" rx="20"/>
        </svg>
        <svg width={W} height={H} style={{ position:'absolute', inset:0, zIndex:1 }}>
          {edges.map((e,i) => {
            const a=byId(e.from), b=byId(e.to);
            return (
              <g key={i}>
                <path d={bezier(a,b)} fill="none" stroke={`${a.color}33`} strokeWidth="8" strokeLinecap="round"/>
                <path d={bezier(a,b)} fill="none" stroke={a.color} strokeWidth="1.5" strokeLinecap="round"
                  strokeDasharray="6 4" opacity="0.65"
                  style={{ animation:`dash-flow ${2.5+i*0.3}s linear infinite` }}/>
                <circle cx={cx(b)-4} cy={cy(b)} r="4" fill={a.color} opacity="0.8"
                  style={{ animation:`pulse-dot ${2+i*0.2}s ease-in-out infinite` }}/>
              </g>
            );
          })}
        </svg>
        {nodes.map(node => (
          <div key={node.id} className={`liquid-glass ${node.cls}`}
            style={{ position:'absolute', left:node.x, top:node.y, width:NW, borderRadius:14,
              padding:'12px 14px', zIndex:2, borderTop:`2px solid ${node.color}55` }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:node.color, flexShrink:0 }}/>
              <span style={{ fontFamily:'Barlow, sans-serif', fontWeight:500, fontSize:'0.75rem', color:'white' }}>{node.label}</span>
            </div>
            <p style={{ fontFamily:'Barlow, sans-serif', fontWeight:300, fontSize:'0.68rem', color:'rgba(255,255,255,0.4)', paddingLeft:15 }}>{node.sub}</p>
            <div style={{ position:'absolute', right:-5, top:'50%', transform:'translateY(-50%)', width:9, height:9, borderRadius:'50%', background:node.color, border:'1.5px solid rgba(255,255,255,0.5)' }}/>
            <div style={{ position:'absolute', left:-5, top:'50%', transform:'translateY(-50%)', width:9, height:9, borderRadius:'50%', background:'rgba(255,255,255,0.1)', border:'1.5px solid rgba(255,255,255,0.3)' }}/>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Footer ── */
function FooterBar({ setPage }) {
  const navLinks = [
    { id: 'home',         label: 'Home' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'pricing',      label: 'Pricing' },
    { id: 'contact',      label: 'Contact' },
  ];
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 56, marginTop: 60 }}>
      <div style={{ display: 'flex', gap: 60, flexWrap: 'wrap', marginBottom: 48 }}>
        <div style={{ flex: '1 1 220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 14 }} onClick={() => setPage('home')}>
            <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="9" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
              <polygon points="18,7 29,14 29,26 18,29 7,22 7,10" fill="none" stroke="white" strokeWidth="1.5"/>
              <circle cx="18" cy="18" r="3" fill="white" opacity="0.9"/>
            </svg>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.1rem', color: 'white' }}>ATREOX AI</span>
          </div>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: 'rgba(255,255,255,0.32)', lineHeight: 1.65, maxWidth: 210 }}>
            Production-ready AI influencer characters. Real faces. Real income.
          </p>
        </div>
        <div style={{ flex: '0 0 auto' }}>
          <h5 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>Navigation</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {navLinks.map(link => (
              <span key={link.id} onClick={() => setPage(link.id)}
                style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.48)', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'white'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.48)'}
              >{link.label}</span>
            ))}
          </div>
        </div>
        <div style={{ flex: '0 0 auto' }}>
          <h5 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>Legal</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[['privacy','Privacy Policy'],['terms','Terms of Service']].map(([id, label]) => (
              <span key={id} onClick={() => setPage(id)}
                style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.38)', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'white'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.38)'}
              >{label}</span>
            ))}
          </div>
        </div>
        <div style={{ flex: '0 0 auto' }}>
          <h5 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>Contact</h5>
          <a href="mailto:hello@atreoxai.com" style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.82rem', color: 'rgba(255,255,255,0.42)', textDecoration: 'none', display: 'block', marginBottom: 8 }}>hello@atreoxai.com</a>
          <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.78rem', color: 'rgba(255,255,255,0.25)' }}>Mon–Fri, 9 AM–6 PM UTC</span>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 22, paddingBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.73rem', color: 'rgba(255,255,255,0.22)' }}>© 2026 ATREOX AI. All rights reserved.</span>
        <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.73rem', color: 'rgba(255,255,255,0.22)' }}>Crafted for AI creators worldwide</span>
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
  motion, AnimatePresence, useInView,
  getCurrentUser, registerUser, loginUser, loginWithProvider, logoutUser,
  ArrowUpRight, Play, Zap, Palette, BarChart3, Shield, Check, Star,
  ChevronRight, ChevronDown, Users, BookOpen, GitBranch, Code2, Cpu,
  Layers, Server, Lock, Globe, Brain, Award, Clock, MessageSquare,
  TrendingUp, Sparkles, Network, Workflow, MonitorPlay, X, Menu, Info, CreditCard,
  UserIcon, MailIcon2,
  Navbar, AuthModal, BlurText, HLSVideo, FadeTop, FadeBottom,
  NodeWorkflow, SectionBadge, SectionHeading, GlassBtn, FooterBar, FieldWrap, BgColorSystem,
});
