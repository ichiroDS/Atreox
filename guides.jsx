
/* ══════════════════════════════════════════════════════════════════
   guides.jsx — the page that teaches.

   Two views, one page. The index is a wall of floating cards, one per
   guide, carrying a name and a handful of words — enough to choose
   from, never enough to read instead of opening. Clicking one opens
   the reader: every guide in a rail down the left, the chosen one in
   the middle, and the module it belongs to (with its price and the way
   into the panel) held in a rail on the right.

   The reader builds its body from catalog.jsx — a module guide is the
   module's own write-up, laid out as a lesson — so a guide is never
   emptier than the Functions page it teaches. Screens and video drop
   into the same sections later without the layout changing.

   The page says nothing about which guides have been filmed. A video
   URL in the catalog adds a Watch button; no URL simply means no
   button, and the written guide is the guide either way.

   EVERY link into a guide is a real <a href="/guides/<url>">, and every
   one of those addresses is a file scripts/prerender.mjs writes from
   this same catalog at build time. The clicks are intercepted so the
   reader still swaps in place, but nothing here depends on that: middle
   click, copy-link and a crawler that runs no JS all land on the page.
══════════════════════════════════════════════════════════════════ */

const React = window.React;
const { useRef, useState, useEffect } = React;
const {
  motion, useInView,
  ArrowUpRight, Check, Play, BookOpen, ChevronRight, Shield, Zap, X,
  PageHero, PageSection, SectionLockup, Pill, CrossLinks, FooterBar,
  MONO, SERIF, GUIDES, MODULE_BY_KEY, eur, REDUCED_MOTION,
  guideHref, guideFromPath, GUIDE_BY_SLUG,
} = window;

const GREEN = window.ACCENT;
const GREEN_RGB = window.ACCENT_RGB;
const CONTACT = 'hello@atreoxai.com';
const DASHBOARD_URL = 'https://app.atreoxai.com';

/* Which guide the current URL is asking for. The path is the answer;
   the hash is only still read because a link from before guides had
   their own pages may reach the app after the redirect in index.html
   has already run (an in-page navigation, say). */
const slugFromLocation = () => {
  const byPath = guideFromPath(window.location.pathname);
  if (byPath) return byPath.slug;
  const h = window.location.hash;
  if (h && h.indexOf('#guide-') === 0 && GUIDE_BY_SLUG[h.slice(7)]) return h.slice(7);
  return null;
};

/* A left click with no modifier is ours to handle; anything else —
   middle click, ctrl/cmd, shift, a right-click menu — is the browser's,
   and the href is a real address, so letting it through is correct. */
const plainClick = e =>
  !e.defaultPrevented && e.button === 0 &&
  !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

/* ══════════════════════════════════════════════════════════════════
   THE INDEX
══════════════════════════════════════════════════════════════════ */

/* One guide, as little as it can say and still be chosen from: the
   module's own icon, its name, four or five words, and what it costs. */
function GuideTile({ guide, index, inView, onOpen }) {
  const mod = guide.module ? MODULE_BY_KEY[guide.module] : null;
  const Icon = mod ? mod.icon : BookOpen;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: Math.min(index, 7) * 0.06 }}
      className="float-wrap" style={{ animationDelay: (index % 4) * 0.7 + 's' }}>
      <a href={guideHref(guide)}
        onClick={e => { if (plainClick(e)) { e.preventDefault(); onOpen(guide.slug); } }}
        className="panel panel-hover ticks guide-tile"
        style={{
          width: '100%', textAlign: 'left', padding: '24px 22px 20px',
          display: 'flex', flexDirection: 'column', gap: 14, background: 'transparent',
          textDecoration: 'none', color: 'inherit', cursor: 'pointer',
        }}>
        <span aria-hidden="true" className="guide-tile-chip" style={{
          width: 44, height: 44, borderRadius: 6,
          background: `rgba(${GREEN_RGB},0.09)`, border: `1px solid rgba(${GREEN_RGB},0.26)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 22px rgba(${GREEN_RGB},0.12)`,
        }}>
          <Icon size={20} color={GREEN} />
        </span>

        <span style={{ display: 'block' }}>
          <span style={{ display: 'block', fontFamily: SERIF, fontWeight: 500, fontSize: '1.22rem', color: 'white', lineHeight: 1.25, letterSpacing: '-0.01em', marginBottom: 7 }}>
            {guide.title}
          </span>
          <span style={{ display: 'block', fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
            {guide.short}
          </span>
        </span>

        <span style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto', paddingTop: 4 }}>
          <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)' }}>
            {guide.covers.length} chapters
          </span>
          {mod && (
            <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: mod.included ? 'rgba(255,255,255,0.42)' : `rgba(${GREEN_RGB},0.8)` }}>
              · {mod.included ? 'included' : eur(mod.price) + '/mo'}
            </span>
          )}
          <ArrowUpRight size={15} color={GREEN} style={{ marginLeft: 'auto' }} />
        </span>
      </a>
    </motion.div>
  );
}

function GuideWall({ guides, offset, onOpen, fill }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.03 });
  return (
    /* auto-fill for the pair at the top, so two cards stay card-sized
       instead of stretching to half the page and reading as banners */
    <div ref={ref} style={{ display: 'grid', gridTemplateColumns: `repeat(${fill ? 'auto-fill' : 'auto-fit'}, minmax(250px, 1fr))`, gap: 18 }}>
      {guides.map((g, i) => (
        <GuideTile key={g.slug} guide={g} index={offset + i} inView={inView} onOpen={onOpen} />
      ))}
    </div>
  );
}

function GuideIndex({ onOpen }) {
  const setup = GUIDES.filter(g => g.group === 'setup');
  const modules = GUIDES.filter(g => g.group === 'module');
  return (
    <div>
      <PageHero
        badge="Guides"
        title="Learn it once, then run it."
        sub="Two things to get right before you start, and one guide per module. Open any of them — each one walks the panel end to end."
      />

      <PageSection style={{ paddingBottom: 30 }}>
        <SectionLockup title="Before you start">
          The two things you buy elsewhere and bring with you.
        </SectionLockup>
        <GuideWall guides={setup} offset={0} onOpen={onOpen} fill />
      </PageSection>

      <PageSection style={{ paddingTop: 0 }}>
        <SectionLockup title="Module guides">
          One per module, in the order the pipeline runs them.
        </SectionLockup>
        <GuideWall guides={modules} offset={setup.length} onOpen={onOpen} />
      </PageSection>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   THE READER
══════════════════════════════════════════════════════════════════ */

function ReaderHeading({ children, n }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 40, marginBottom: 16 }}>
      {n && (
        <span aria-hidden="true" style={{
          width: 24, height: 24, borderRadius: 3, flexShrink: 0,
          border: `1px solid rgba(${GREEN_RGB},0.32)`, background: `rgba(${GREEN_RGB},0.07)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: MONO, fontWeight: 600, fontSize: '0.58rem', color: GREEN, lineHeight: 1,
        }}>{n}</span>
      )}
      <h2 style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'white' }}>
        {children}
      </h2>
      <span aria-hidden="true" className="section-rule" style={{ flex: '1 1 24px', minWidth: 24 }} />
    </div>
  );
}

const readerProse = {
  fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1rem',
  color: 'rgba(255,255,255,0.72)', lineHeight: 1.8,
};

/* A numbered step with the rail that makes a list read as a sequence. */
function ReaderStep({ n, title, body, last }) {
  return (
    <div style={{ display: 'flex', gap: 16, paddingBottom: last ? 0 : 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 3, flexShrink: 0,
          border: `1px solid rgba(${GREEN_RGB},0.34)`, background: `rgba(${GREEN_RGB},0.07)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: MONO, fontWeight: 600, fontSize: '0.62rem', color: GREEN, lineHeight: 1,
        }}>{String(n).padStart(2, '0')}</span>
        {!last && <span aria-hidden="true" style={{ flex: 1, width: 1, marginTop: 6, background: `linear-gradient(180deg, rgba(${GREEN_RGB},0.3), rgba(${GREEN_RGB},0.05))` }} />}
      </div>
      <div style={{ minWidth: 0, paddingTop: 4 }}>
        <h3 style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.72rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'white', marginBottom: 8 }}>{title}</h3>
        <p style={{ ...readerProse, fontSize: '0.94rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.66)' }}>{body}</p>
      </div>
    </div>
  );
}

/* The rail on the left: every guide, always, so moving between them
   never costs a trip back to the index. */
function ReaderNav({ slug, onOpen, compact }) {
  const groups = [
    ['Before you start', GUIDES.filter(g => g.group === 'setup')],
    ['Module guides', GUIDES.filter(g => g.group === 'module')],
  ];
  const item = g => {
    const on = g.slug === slug;
    const mod = g.module ? MODULE_BY_KEY[g.module] : null;
    const Icon = mod ? mod.icon : BookOpen;
    return (
      <a key={g.slug} href={guideHref(g)}
        onClick={e => { if (plainClick(e)) { e.preventDefault(); onOpen(g.slug); } }}
        aria-current={on ? 'page' : undefined}
        className="guide-nav-item"
        style={{
          display: 'flex', alignItems: 'center', gap: 10, width: compact ? 'auto' : '100%',
          flexShrink: 0, textAlign: 'left', padding: '10px 12px', borderRadius: 4,
          border: `1px solid ${on ? `rgba(${GREEN_RGB},0.4)` : 'transparent'}`,
          background: on ? `rgba(${GREEN_RGB},0.1)` : 'transparent',
          whiteSpace: compact ? 'nowrap' : 'normal',
          textDecoration: 'none', cursor: 'pointer',
        }}>
        <Icon size={14} color={on ? GREEN : 'rgba(255,255,255,0.4)'} />
        <span style={{
          flex: 1, minWidth: 0, fontFamily: 'Barlow, sans-serif', fontWeight: on ? 500 : 300,
          fontSize: '0.9rem', lineHeight: 1.35, color: on ? 'white' : 'rgba(255,255,255,0.6)',
        }}>{g.title}</span>
        {on && <Check size={14} color={GREEN} />}
      </a>
    );
  };

  if (compact) {
    return (
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 8 }}>
        {GUIDES.map(item)}
      </div>
    );
  }
  return (
    <nav className="panel" style={{ padding: 12, position: 'sticky', top: 92 }}>
      {groups.map(([title, list], gi) => (
        <div key={title} style={{ marginBottom: gi === 0 ? 14 : 0 }}>
          <span style={{ display: 'block', padding: '6px 12px 10px', fontFamily: MONO, fontWeight: 500, fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: `rgba(${GREEN_RGB},0.6)` }}>
            {title}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{list.map(item)}</div>
        </div>
      ))}
    </nav>
  );
}

/* The rail on the right: what this guide is teaching you to run, what
   it costs, and the button that starts it. */
function ReaderRail({ guide, mod, setPage, compact }) {
  const Icon = mod ? mod.icon : Shield;
  return (
    <aside className="panel ticks" style={{ padding: '24px 22px', position: compact ? 'static' : 'sticky', top: 92 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <span aria-hidden="true" style={{
          width: 40, height: 40, borderRadius: 5, flexShrink: 0,
          background: `rgba(${GREEN_RGB},0.09)`, border: `1px solid rgba(${GREEN_RGB},0.26)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={GREEN} />
        </span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: 'block', fontFamily: MONO, fontWeight: 500, fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: `rgba(${GREEN_RGB},0.7)`, marginBottom: 4 }}>
            {mod ? 'Module' : 'Preparation'}
          </span>
          <span style={{ display: 'block', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.98rem', color: 'white', lineHeight: 1.25 }}>
            {mod ? mod.name : 'Before you start'}
          </span>
        </span>
      </div>

      {mod && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, paddingBottom: 18, marginBottom: 18, borderBottom: `1px solid rgba(${GREEN_RGB},0.14)` }}>
          <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '2rem', color: mod.included ? 'white' : GREEN, lineHeight: 1, textShadow: mod.included ? 'none' : `0 0 26px rgba(${GREEN_RGB},0.3)` }}>
            {mod.included ? 'Free' : eur(mod.price)}
          </span>
          <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>
            {mod.included ? 'with any module' : '/ month'}
          </span>
        </div>
      )}

      <span style={{ display: 'block', fontFamily: MONO, fontWeight: 500, fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 14 }}>
        {'// '}Start in three steps
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 22 }}>
        {[
          'Load your accounts and proxies',
          mod ? `Switch on ${mod.name}` : 'Import them through Account Manager',
          'Watch the log and adjust',
        ].map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
            <span aria-hidden="true" style={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1,
              border: `1px solid rgba(${GREEN_RGB},0.32)`, background: `rgba(${GREEN_RGB},0.08)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: MONO, fontWeight: 600, fontSize: '0.55rem', color: GREEN, lineHeight: 1,
            }}>{i + 1}</span>
            <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.88rem', color: 'rgba(255,255,255,0.66)', lineHeight: 1.5 }}>{t}</span>
          </div>
        ))}
      </div>

      <a href={window.withReferral(DASHBOARD_URL)} target="_self" className="btn-solid"
        style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: '0.76rem', marginBottom: 10 }}>
        Start working <ArrowUpRight size={14} />
      </a>
      {mod ? (
        <button type="button" className="btn-outline" onClick={() => setPage('functions', 'fn-' + mod.key)}
          style={{ width: '100%', justifyContent: 'center', padding: '13px 20px', fontSize: '0.74rem' }}>
          What it does <ArrowUpRight size={13} />
        </button>
      ) : (
        <a href={`mailto:${CONTACT}?subject=Setup%20help`} className="btn-outline"
          style={{ width: '100%', justifyContent: 'center', padding: '13px 20px', fontSize: '0.74rem' }}>
          Ask us directly <ArrowUpRight size={13} />
        </a>
      )}
    </aside>
  );
}

function GuideReader({ slug, onOpen, onClose, setPage }) {
  const guide = GUIDES.find(g => g.slug === slug) || GUIDES[0];
  const mod = guide.module ? MODULE_BY_KEY[guide.module] : null;
  const [compact, setCompact] = useState(window.innerWidth < 1040);

  useEffect(() => {
    const onResize = () => setCompact(window.innerWidth < 1040);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div style={{ paddingTop: 128 }}>
      <div style={{ maxWidth: 1340, margin: '0 auto', padding: '0 5%' }}>

        <a href="/guides" onClick={e => { if (plainClick(e)) { e.preventDefault(); onClose(); } }}
          className="quiet-link quiet-link-dim" style={{ marginBottom: 26 }}>
          <span aria-hidden="true" style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}><ChevronRight size={12} /></span>
          All guides
        </a>

        <div style={{ display: 'flex', gap: 30, alignItems: 'flex-start', flexWrap: compact ? 'wrap' : 'nowrap' }}>

          {/* left rail */}
          <div style={{ flex: compact ? '1 1 100%' : '0 0 250px', minWidth: 0, width: compact ? '100%' : undefined }}>
            <ReaderNav slug={guide.slug} onOpen={onOpen} compact={compact} />
          </div>

          {/* the guide */}
          {/* the id is what a link from Functions lands on; the margin
              leaves the way back out of the guide above the fold */}
          <article id={'guide-' + guide.slug} style={{ flex: '1 1 420px', minWidth: 0, scrollMarginTop: 150 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
              <Pill dot>{mod ? mod.tagline : 'Preparation'}</Pill>
              {guide.video && (
                <a href={guide.video} target="_blank" rel="noopener noreferrer" className="quiet-link">
                  <Play size={11} /> Watch the video <ArrowUpRight size={12} />
                </a>
              )}
            </div>

            <h1 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(2rem, 4vw, 2.9rem)', color: 'white', letterSpacing: '-0.015em', lineHeight: 1.1, marginBottom: 18 }}>
              {guide.title}
            </h1>
            <p style={{ ...readerProse, fontSize: '1.05rem', color: 'rgba(255,255,255,0.78)', marginBottom: 6 }}>
              {guide.summary}
            </p>

            {/* chapters — the map of the page, and the slots screens land in */}
            <ReaderHeading>In this guide</ReaderHeading>
            <div className="panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {guide.covers.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.62rem', color: `rgba(${GREEN_RGB},0.6)`, marginTop: 4, flexShrink: 0 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{c}</span>
                </div>
              ))}
            </div>

            {guide.intro && (
              <>
                <ReaderHeading>Why it matters</ReaderHeading>
                <p style={readerProse}>{guide.intro}</p>
              </>
            )}

            {mod && (
              <>
                <ReaderHeading>Why it matters</ReaderHeading>
                <p style={readerProse}>{mod.problem}</p>

                <ReaderHeading>What the module does</ReaderHeading>
                <p style={readerProse}>{mod.does}</p>

                <ReaderHeading>Step by step</ReaderHeading>
                <div>
                  {mod.steps.map(([t, b], i) => (
                    <ReaderStep key={t} n={i + 1} title={t} body={b} last={i === mod.steps.length - 1} />
                  ))}
                </div>

                <ReaderHeading>What you can change</ReaderHeading>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
                  {mod.config.map(([t, b]) => (
                    <div key={t} className="panel" style={{ padding: '16px 18px' }}>
                      <span style={{ display: 'block', fontFamily: MONO, fontWeight: 500, fontSize: '0.62rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: GREEN, marginBottom: 8 }}>{t}</span>
                      <span style={{ display: 'block', fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.88rem', color: 'rgba(255,255,255,0.62)', lineHeight: 1.65 }}>{b}</span>
                    </div>
                  ))}
                </div>

                {mod.guard && (
                  <>
                    <ReaderHeading>Read this before you turn it up</ReaderHeading>
                    <div className="panel" style={{ padding: '20px 22px', display: 'flex', gap: 14, alignItems: 'flex-start', borderColor: `rgba(${GREEN_RGB},0.3)` }}>
                      <Shield size={17} color={GREEN} style={{ marginTop: 3, flexShrink: 0 }} />
                      <p style={{ ...readerProse, fontSize: '0.94rem', lineHeight: 1.75, margin: 0 }}>{mod.guard}</p>
                    </div>
                  </>
                )}
              </>
            )}

            <div style={{ marginTop: 44, paddingTop: 22, borderTop: `1px solid rgba(${GREEN_RGB},0.14)`, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.92rem', color: 'rgba(255,255,255,0.55)' }}>
                Something here not clear enough?
              </span>
              <a href={`mailto:${CONTACT}?subject=Guide%3A%20${encodeURIComponent(guide.title)}`} className="quiet-link">
                Tell us and we'll fix it <ArrowUpRight size={12} />
              </a>
            </div>
          </article>

          {/* right rail */}
          <div style={{ flex: compact ? '1 1 100%' : '0 0 270px', minWidth: 0, width: compact ? '100%' : undefined }}>
            <ReaderRail guide={guide} mod={mod} setPage={setPage} compact={compact} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   THE PAGE
══════════════════════════════════════════════════════════════════ */
function GuidesPage({ setPage }) {
  const [slug, setSlug] = useState(slugFromLocation);

  /* The open guide IS the URL — /guides/<url> is a page of its own that
     the server can serve on its own. Which one is showing is therefore
     read back off the address, both when the browser moves through
     history and when the app navigates here without remounting us. */
  useEffect(() => {
    const sync = () => setSlug(slugFromLocation());
    window.addEventListener('popstate', sync);
    window.addEventListener('atreox:navigate', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('atreox:navigate', sync);
    };
  }, []);

  const go = (next, path) => {
    setSlug(next);
    try { window.history.pushState({ page: 'guides', anchor: null }, '', path); } catch (_) {}
    window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
  };
  const open = s => go(s, guideHref(s));
  const close = () => go(null, '/guides');

  return (
    <div>
      {slug
        ? <GuideReader slug={slug} onOpen={open} onClose={close} setPage={setPage} />
        : <GuideIndex onOpen={open} />}

      <CrossLinks current="guides" setPage={setPage} />
      <div style={{ padding: '0 5% 64px' }}><FooterBar setPage={setPage} /></div>
    </div>
  );
}

Object.assign(window, { GuidesPage });
