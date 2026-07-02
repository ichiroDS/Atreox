
const React = window.React;
const { AnimatePresence, motion } = window;
const {
  Navbar, BgColorSystem,
  HomePage,
  FunctionsPage, PricingPage,
  PrivacyPage, TermsPage,
} = window;

/* ── Error Boundary ── */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(e) { return { err: e }; }
  componentDidCatch(e) {
    /* swallow — prevents propagation to global error handler */
    if (typeof window.__hideSplash === 'function') window.__hideSplash();
  }
  render() {
    if (this.state.err) return React.createElement('div', {
      style: { color: 'white', padding: 40, fontFamily: 'Barlow, sans-serif' }
    }, 'Something went wrong. Please refresh.');
    return this.props.children;
  }
}

const PATH_TO_PAGE = {
  '/functions': 'functions',
  '/pricing':   'pricing',
  '/privacy':   'privacy',
  '/terms':     'terms',
};

const PAGE_TO_PATH = {
  'home':      '/',
  'functions': '/functions',
  'pricing':   '/pricing',
  'privacy':   '/privacy',
  'terms':     '/terms',
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
  const [page, setPage] = React.useState(getInitialPage);

  /* App is mounted — dismiss the boot splash (min display time handled there) */
  React.useEffect(() => {
    if (typeof window.__hideSplash === 'function') window.__hideSplash();
  }, []);

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

  const renderPage = () => {
    switch (page) {
      case 'functions': return <FunctionsPage setPage={navigate} />;
      case 'pricing':   return <PricingPage   setPage={navigate} />;
      case 'privacy':   return <PrivacyPage   setPage={navigate} />;
      case 'terms':     return <TermsPage     setPage={navigate} />;
      default:          return <HomePage      setPage={navigate} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <BgColorSystem page={page} />
      <Navbar currentPage={page} setPage={navigate} />

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
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ErrorBoundary><App /></ErrorBoundary>);
