
const React = window.React;
const { useState } = React;
const { AnimatePresence, motion } = window;
const {
  getCurrentUser, logoutUser,
  Navbar, AuthModal, BgColorSystem,
  HomePage,
  CurriculumPage, CommunityPage, PricingPage, AboutPage,
  CoursesPage, ResourcesPage, ContactPage,
  CheckoutPage, PackagesPage,
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
  const [page, setPage]         = useState(() => localStorage.getItem('atreox_page') || 'home');
  const [user, setUser]         = useState(() => getCurrentUser());
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const navigate = (p) => {
    setPage(p);
    localStorage.setItem('atreox_page', p);
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
      case 'packages':   return <PackagesPage   setPage={navigate} />;
      case 'courses':    return <CoursesPage    setPage={navigate} user={user} onLoginClick={openLogin} />;
      case 'checkout':   return <CheckoutPage   setPage={navigate} user={user} />;
      case 'resources':  return <ResourcesPage  setPage={navigate} />;
      case 'contact':    return <ContactPage    setPage={navigate} />;
      case 'curriculum': return <CurriculumPage setPage={navigate} />;
      case 'community':  return <CommunityPage  setPage={navigate} />;
      case 'pricing':    return <PricingPage    setPage={navigate} />;
      case 'about':      return <AboutPage      setPage={navigate} />;
      case 'privacy':    return <PrivacyPage    setPage={navigate} />;
      case 'terms':      return <TermsPage      setPage={navigate} />;
      default:           return <HomePage       setPage={navigate} onLoginClick={openLogin} />;
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
