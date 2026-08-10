
const React = window.React;
const { AnimatePresence, motion } = window;
const {
  Navbar, BgColorSystem,
  HomePage,
  FunctionsPage, PricingPage, GuidesPage,
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
  '/guides':    'guides',
  '/privacy':   'privacy',
  '/terms':     'terms',
};

const PAGE_TO_PATH = {
  'home':      '/',
  'functions': '/functions',
  'pricing':   '/pricing',
  'guides':    '/guides',
  'privacy':   '/privacy',
  'terms':     '/terms',
};

/* Scroll to an anchor once the incoming page has actually rendered.
   Two frames rather than one: the first lands after React commits, the
   second after the browser has laid the new page out — before that, the
   target element exists but has no final position to scroll to. The
   setTimeout is the belt-and-braces path for a slow first paint. */
function scrollToAnchor(id) {
  let tries = 0;
  const attempt = () => {
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if (tries++ < 12) setTimeout(attempt, 40);
  };
  requestAnimationFrame(() => requestAnimationFrame(attempt));
}

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
    /* honour a deep link like /functions#fn-neurodialogs on first load */
    if (location.hash.length > 1) scrollToAnchor(location.hash.slice(1));
  }, []);

  React.useEffect(() => {
    const onPop = (e) => {
      const p = e.state?.page || PATH_TO_PAGE[location.pathname] || 'home';
      setPage(p);
      const anchor = e.state?.anchor || (location.hash.length > 1 ? location.hash.slice(1) : null);
      if (anchor) scrollToAnchor(anchor);
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  /* `anchor` lets one page hand off to a specific section of another —
     Functions → a guide card, Guides → a module write-up, the home
     pipeline → either. It's part of the URL so the landing spot survives
     a copied link and the back button. */
  const navigate = (p, anchor) => {
    const path = (PAGE_TO_PATH[p] || '/') + (anchor ? '#' + anchor : '');
    setPage(p);
    history.pushState({ page: p, anchor: anchor || null }, '', path);
    if (anchor) scrollToAnchor(anchor);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (page) {
      case 'functions': return <FunctionsPage setPage={navigate} />;
      case 'pricing':   return <PricingPage   setPage={navigate} />;
      case 'guides':    return <GuidesPage    setPage={navigate} />;
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
