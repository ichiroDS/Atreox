
const React = window.React;
const { AnimatePresence, motion } = window;
const {
  Navbar, BgColorSystem,
  HomePage,
  FunctionsPage, PricingPage, GuidesPage,
  PrivacyPage, TermsPage, ReferralPage, ContactPage,
  guideHref, guideFromPath,
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
  '/refund':    'refund',
  '/referral-program': 'referral',
  '/contact':   'contact',
};

const PAGE_TO_PATH = {
  'home':      '/',
  'functions': '/functions',
  'pricing':   '/pricing',
  'guides':    '/guides',
  'privacy':   '/privacy',
  'terms':     '/terms',
  'refund':    '/refund',
  'referral':  '/referral-program',
  'contact':   '/contact',
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

/* Each guide has its own path, /guides/<url>, served as a prerendered
   file. Everything under /guides/ is still the Guides page — the page
   reads the last segment itself to decide which guide is open. */
function pageFromPath(pathname) {
  if (pathname === '/guides' || pathname.indexOf('/guides/') === 0) return 'guides';
  return PATH_TO_PAGE[pathname] || 'home';
}

/* Where a navigation lands, as a URL. A guide is a real address rather
   than an anchor on /guides, so `guide-<slug>` — the shape Functions
   and the old deep links use — resolves to that address here. */
function pathFor(page, anchor) {
  if (anchor && anchor.indexOf('guide-') === 0) {
    return guideHref(anchor.slice(6));
  }
  return (PAGE_TO_PATH[page] || '/') + (anchor ? '#' + anchor : '');
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
  return pageFromPath(location.pathname);
}

function App() {
  const [page, setPage] = React.useState(getInitialPage);

  /* App is mounted — dismiss the boot splash (min display time handled there) */
  React.useEffect(() => {
    /* The prerendered guide this page shipped with has done its job the
       moment React has something to put in its place. */
    const pre = document.getElementById('prerendered');
    if (pre && pre.parentNode) pre.parentNode.removeChild(pre);

    if (typeof window.__hideSplash === 'function') window.__hideSplash();
    /* honour a deep link like /functions#fn-neurodialogs on first load */
    if (location.hash.length > 1) scrollToAnchor(location.hash.slice(1));
  }, []);

  React.useEffect(() => {
    const onPop = (e) => {
      const p = e.state?.page || pageFromPath(location.pathname);
      setPage(p);
      const anchor = e.state?.anchor || (location.hash.length > 1 ? location.hash.slice(1) : null);
      if (anchor) scrollToAnchor(anchor);
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  /* `anchor` lets one page hand off to a specific section of another —
     Functions → a guide, Guides → a module write-up, the home pipeline
     → either. It's part of the URL so the landing spot survives a
     copied link and the back button.

     A `guide-<slug>` anchor is the exception: guides are pages now, so
     it resolves to /guides/<url> and there is nothing to scroll to. */
  const navigate = (p, anchor) => {
    const isGuide = !!anchor && anchor.indexOf('guide-') === 0;
    const path = pathFor(p, anchor);
    setPage(p);
    history.pushState({ page: p, anchor: isGuide ? null : (anchor || null) }, '', path);
    /* pushState fires nothing on its own, and a page that reads the URL
       for its own sub-state (Guides does) has no other way to notice a
       navigation that doesn't remount it — nav "Guides" while already
       inside a guide, for one. */
    try { window.dispatchEvent(new Event('atreox:navigate')); } catch (_) {}
    if (anchor && !isGuide) scrollToAnchor(anchor);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (page) {
      case 'functions': return <FunctionsPage setPage={navigate} />;
      case 'pricing':   return <PricingPage   setPage={navigate} />;
      case 'guides':    return <GuidesPage    setPage={navigate} />;
      case 'privacy':   return <PrivacyPage   setPage={navigate} />;
      case 'terms':     return <TermsPage     setPage={navigate} />;
      case 'refund':    return <RefundPage    setPage={navigate} />;
      case 'contact':   return <ContactPage   setPage={navigate} />;
      case 'referral':  return <ReferralPage  setPage={navigate} />;
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
