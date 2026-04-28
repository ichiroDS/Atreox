
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

function App() {
  const [page, setPage]         = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('p') || localStorage.getItem('atreox_page') || 'home';
  });
  const [user, setUser]         = useState(() => getCurrentUser());
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  React.useEffect(() => {
    history.replaceState({ page }, '', `?p=${page}`);
  }, []);

  React.useEffect(() => {
    const onPop = (e) => {
      const p = e.state?.page || new URLSearchParams(location.search).get('p') || 'home';
      setPage(p);
      localStorage.setItem('atreox_page', p);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (p) => {
    setPage(p);
    localStorage.setItem('atreox_page', p);
    history.pushState({ page: p }, '', `?p=${p}`);
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
