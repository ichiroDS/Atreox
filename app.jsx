
const React = window.React;
const { useState } = React;
const { AnimatePresence, motion } = window;
const {
  getCurrentUser, logoutUser,
  Navbar, AuthModal, BgColorSystem,
  HomePage,
  PricingPage,
  ContactPage,
  CheckoutPage, HowItWorksPage, MeetAtreoxPage,
  SettingsPage,
  PrivacyPage, TermsPage,
} = window;

/* ── Error Boundary ── */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(e) { return { err: e }; }
  componentDidCatch(e) { /* swallow — prevents propagation to global error handler */ }
  render() {
    if (this.state.err) return React.createElement('div', {
      style: { color: 'white', padding: 40, fontFamily: 'Barlow, sans-serif' }
    }, 'Something went wrong. Please refresh.');
    return this.props.children;
  }
}

const PATH_TO_PAGE = {
  '/meet':         'meet',
  '/how-it-works': 'how-it-works',
  '/pricing':      'pricing',
  '/packages':     'pricing',
  '/courses':      'pricing',
  '/checkout':     'checkout',
  '/contact':      'contact',
  '/settings':     'settings',
  '/privacy':      'privacy',
  '/terms':        'terms',
};

const PAGE_TO_PATH = {
  'home':         '/',
  'meet':         '/meet',
  'how-it-works': '/how-it-works',
  'pricing':      '/pricing',
  'packages':     '/pricing',
  'courses':      '/pricing',
  'checkout':     '/checkout',
  'contact':      '/contact',
  'settings':     '/settings',
  'privacy':      '/privacy',
  'terms':        '/terms',
};

function getInitialPage() {
  /* Redirect legacy ?p= URLs to clean paths */
  const params = new URLSearchParams(location.search);
  const legacy = params.get('p');
  if (legacy) {
    const path = PAGE_TO_PATH[legacy] || '/';
    history.replaceState({ page: legacy || 'home' }, '', path);
    return legacy || 'home';
  }
  return PATH_TO_PAGE[location.pathname] || 'home';
}

function App() {
  const [page, setPage]         = useState(getInitialPage);
  const [user, setUser]         = useState(() => getCurrentUser());
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  React.useEffect(() => {
    const onPop = (e) => {
      const p = e.state?.page || PATH_TO_PAGE[location.pathname] || 'home';
      setPage(p);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (p) => {
    const path = PAGE_TO_PATH[p] || '/';
    setPage(p);
    history.pushState({ page: p }, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openLogin    = () => { setAuthMode('login');    setShowAuth(true); };
  const openRegister = () => { setAuthMode('register'); setShowAuth(true); };

  const handleAuthSuccess = (u) => {
    setUser(u);
    setShowAuth(false);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  const renderPage = () => {
    switch (page) {
      case 'meet':         return <MeetAtreoxPage  setPage={navigate} />;
      case 'how-it-works': return <HowItWorksPage  setPage={navigate} />;
      case 'pricing':
      case 'packages':
      case 'courses':      return <PricingPage    setPage={navigate} user={user} onLoginClick={openLogin} />;
      case 'checkout':     return <CheckoutPage   setPage={navigate} user={user} />;
      case 'contact':      return <ContactPage    setPage={navigate} />;
      case 'settings':     return <SettingsPage   setPage={navigate} user={user} onLogout={handleLogout} />;
      case 'privacy':      return <PrivacyPage    setPage={navigate} />;
      case 'terms':        return <TermsPage      setPage={navigate} />;
      default:             return <HomePage       setPage={navigate} onLoginClick={openLogin} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <BgColorSystem page={page} />
      <Navbar
        currentPage={page}
        setPage={navigate}
        user={user}
        onLoginClick={openLogin}
        onLogout={handleLogout}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>

      {showAuth && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ErrorBoundary><App /></ErrorBoundary>);
