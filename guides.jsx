
/* ══════════════════════════════════════════════════════════════════
   guides.jsx — the page that teaches.

   Two views, one page. The index is a wall of floating cards, one per
   guide, carrying a name and a handful of words — enough to choose
   from, never enough to read instead of opening. Clicking one opens
   the reader: every guide in a rail down the left, and the chosen one
   filling everything to the right of it. Nothing else — a page you
   came to read is not the place to sell you the next thing.

   The reader builds its body from catalog.jsx. A guide with a `body`
   there is a written guide and renders section by section; a module
   guide without one is the module's own write-up, laid out as a lesson,
   so a guide is never emptier than the Functions page it teaches.
   Screens drop into the same sections without the layout changing.

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

/* Once a browser has committed to a <picture>'s <source>, a failed
   request just leaves a broken image — there's no automatic retry
   against the plain <img src> the way there would be without the
   <source> there at all. scripts/optimize-images.mjs writes a .webp
   sibling for every screenshot at build time, so normally this never
   matters; state (not a DOM patch) is what's used to drop the <source>
   on a failure, because a DOM patch doesn't survive this component's
   next re-render — GuideReader's scrollspy causes plenty of those, and
   each one would silently put the failed <source> right back. */
function GuideFigure({ v }) {
  const [webpFailed, setWebpFailed] = useState(false);
  return (
    <figure className="g-fig">
      <picture>
        {!webpFailed && <source srcSet={v.src.replace(/\.(jpe?g|png)$/i, '.webp')} type="image/webp" />}
        <img src={v.src} alt={v.alt} width={v.w} height={v.h}
          loading="lazy" decoding="async" onError={() => setWebpFailed(true)} />
      </picture>
      <figcaption>{v.caption}</figcaption>
    </figure>
  );
}

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
            {(guide.body || guide.covers).length} chapters
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

/* Two widths, because a reading page needs two. READER_MAX is how wide
   the guide itself gets now that nothing sits to its right — screens,
   tables and the checklist all use it. COLUMN is how wide a paragraph
   is allowed to get inside that, which is a smaller number for the
   oldest reason in typesetting: past roughly 80 characters the eye
   loses the start of the next line. */
const READER_MAX = 1100;
const COLUMN = 790;   /* pairs with --gcol in index.html */

const readerProse = {
  fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1.2rem',
  color: '#fff', lineHeight: 1.8, maxWidth: COLUMN,
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
        <p style={{ ...readerProse, fontSize: '0.94rem', lineHeight: 1.75 }}>{body}</p>
      </div>
    </div>
  );
}

/* ── The blocks a written guide is made of ─────────────────────────
   A guide with a `body` in catalog.jsx carries its own text, section by
   section, as data. This turns that data into the page; the same data
   goes through scripts/prerender.mjs to become the static HTML a
   crawler reads. Neither renderer owns any styling — the class names
   below are defined once in index.html and emitted by both, so the two
   cannot drift apart, and the words have exactly one home. */
function ReaderBlocks({ blocks, onOpen }) {
  return blocks.map((block, i) => {
    const [kind, v] = block;
    switch (kind) {

      case 'p':
        return <p key={i} className="g-p">{v}</p>;

      /* the paragraphs a guide would be pointless without */
      case 'callout':
        return (
          <div key={i} className="g-callout">
            {v.map((t, j) => <p key={j} className="g-p">{t}</p>)}
          </div>
        );

      /* a protocol: the sentences are the steps, unchanged */
      case 'steps':
        return (
          <ol key={i} className="g-steps">
            {v.map((t, j) => <li key={j}><p className="g-p">{t}</p></li>)}
          </ol>
        );

      /* the same job done a lighter way, set apart from the main path */
      case 'card':
        return (
          <div key={i} className="g-card">
            {v.kicker && <span className="g-kicker">{v.kicker}</span>}
            <ReaderBlocks blocks={v.blocks} onOpen={onOpen} />
          </div>
        );

      /* several cards side by side, each its own full sequence — two
         ways to do the same job, not one path with an aside */
      case 'cards':
        return (
          <div key={i} className="g-cards">
            {v.map((c, j) => (
              <div key={j} className="g-card">
                {c.kicker && <span className="g-kicker">{c.kicker}</span>}
                <ReaderBlocks blocks={c.blocks} onOpen={onOpen} />
              </div>
            ))}
          </div>
        );

      /* a short row of equal, neutral choices — not a verdict like
         'plates', just "if this, then that one" */
      case 'options':
        return (
          <div key={i} className="g-options">
            {v.map((o, j) => (
              <div key={j} className="g-option">
                {o.badge && <span className="g-option-badge">{o.badge}</span>}
                <p className="g-p" style={{ margin: 0 }}>{o.text}</p>
              </div>
            ))}
          </div>
        );

      /* parameter — value, the value set in a monospace font because
         it's usually a literal you type in somewhere else */
      case 'kv':
        return (
          <dl key={i} className="g-kv">
            {v.map(([k, val], j) => (
              <div key={j} className="g-kv-row">
                <dt>{k}</dt>
                <dd>{val}</dd>
              </div>
            ))}
          </dl>
        );

      /* the one number a section turns on, said the way 25% is said on
         the referral page */
      case 'stat':
        return (
          <div key={i} className="g-stat">
            <span className="g-stat-value">{v.value}</span>
            <p className="g-p" style={{ margin: 0 }}>{v.label}</p>
          </div>
        );

      /* native <details> — it accordions with zero JS, which matters
         here: the prerendered page gets exactly this same markup */
      case 'faq':
        return (
          <div key={i} className="g-faq">
            {v.map((qa, j) => (
              <details key={j}>
                <summary>{qa.q}</summary>
                <p className="g-p">{qa.a}</p>
              </details>
            ))}
          </div>
        );

      /* width and height are on the element itself: the browser can
         then hold the space before the file arrives, so a screen
         landing mid-scroll never shoves the paragraph you are reading */
      /* scripts/optimize-images.mjs writes a .webp sibling next to every
         screenshot at build time; the catalog only ever names the
         original, so the swap happens here, once, for every figure —
         not something each guide entry has to ask for. */
      case 'figure':
        return <GuideFigure key={i} v={v} />;

      /* a verdict you read without reading: green passes, red doesn't */
      case 'plates':
        return (
          <div key={i} className="g-plates">
            {v.map(pl => (
              <div key={pl.label} className={'g-plate g-' + pl.tone}>
                <span className="g-plate-label">{pl.label}</span>
                <p className="g-p">{pl.text}</p>
              </div>
            ))}
          </div>
        );

      /* Below a width a table's own class flips it into a stack of
         cards, one per row, each cell labelled from its own column
         header via data-label (CSS reads that back with `attr()`) —
         a five-column table with prose in every cell is something you
         scroll sideways through forever otherwise. */
      case 'table':
        return (
          <div key={i} className="g-tablewrap panel">
            <table className="g-table">
              <thead><tr>{v.head.map(h => <th key={h} scope="col">{h}</th>)}</tr></thead>
              <tbody>
                {v.rows.map((r, j) => (
                  <tr key={j}>{r.map((c, k) => (
                    <td key={k} data-label={v.head[k]}>
                      {/* a cell is either plain text or, for something like a
                          Pros/Cons column, a short list — an array says which */}
                      {Array.isArray(c)
                        ? <ul className="g-td-list">{c.map((t, m) => <li key={m}>{t}</li>)}</ul>
                        : c}
                    </td>
                  ))}</tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      /* Tickable, and on purpose not saved anywhere: this is a pass over
         one batch with the marketplace open in the next tab, not a
         document to come back to. Uncontrolled inputs, so the boxes work
         on the prerendered page too — before any of this has booted. */
      case 'checklist':
        return (
          <div key={i} className="g-lists">
            {v.map(col => (
              <div key={col.title} className={'g-list g-' + col.tone}>
                <h3 className="g-list-h">{col.title}</h3>
                <ul>
                  {col.items.map(([label, text], j) => (
                    <li key={j}>
                      <label className="g-check">
                        <input type="checkbox" />
                        <span className="g-check-t"><b>{label}</b> {text}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );

      case 'note':
        return <p key={i} className="g-note">{v}</p>;

      /* a plain list where order isn't the point — unlike 'steps', which
         numbers a sequence you follow in order, this is just a set of
         things that are all true at once */
      case 'bullets':
        return (
          <ul key={i} className="g-bullets">
            {v.map((t, j) => <li key={j}>{t}</li>)}
          </ul>
        );

      /* a single link out, e.g. to the guide this one leans on */
      /* When this points at another guide, it should swap in place like
         every other cross-guide link on the page rather than doing a
         full reload — but it's still a real href underneath, so a
         crawler, a middle click or a copied link all still work. */
      case 'linkout': {
        const target = onOpen && guideFromPath(v.href);
        return (
          <a key={i} href={v.href} className="quiet-link" style={{ marginBottom: 16 }}
            onClick={e => { if (target && plainClick(e)) { e.preventDefault(); onOpen(target.slug); } }}>
            {v.label} <ArrowUpRight size={12} />
          </a>
        );
      }

      default:
        return null;
    }
  });
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
      <div style={{ flex: '1 1 100%', width: '100%', display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 8 }}>
        {GUIDES.map(item)}
      </div>
    );
  }
  return (
    <nav className="panel" style={{ flex: '0 0 250px', minWidth: 0, padding: 12, position: 'sticky', top: 92 }}>
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

/* The chapter list, as links — shared between the sticky sidebar (wide
   viewports) and the inline panel (compact ones, and the fallback for a
   module guide with no `body`). `activeId` is only ever set on the
   sidebar; passing it to the inline panel too costs nothing and keeps
   the two in sync if a resize swaps one for the other mid-scroll. */
function ChapterNav({ sections, activeId }) {
  return sections.map((s, i) => (
    <a key={s.id} href={'#' + s.id} aria-current={s.id === activeId ? 'true' : undefined}>
      <span className="g-toc-n">{String(i + 1).padStart(2, '0')}</span>
      <span className="g-toc-t">{s.title}</span>
    </a>
  ));
}

function GuideReader({ slug, onOpen, onClose }) {
  const guide = GUIDES.find(g => g.slug === slug) || GUIDES[0];
  const mod = guide.module ? MODULE_BY_KEY[guide.module] : null;
  const [compact, setCompact] = useState(window.innerWidth < 1040);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const onResize = () => setCompact(window.innerWidth < 1040);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* Which chapter is "active": the one whose heading is nearest the top
     of a band just under the sticky nav, so the sidebar tracks the
     section you're actually reading rather than the one that merely
     touched the viewport in passing. */
  useEffect(() => {
    if (!guide.body) return;
    const els = guide.body.map(s => document.getElementById(s.id)).filter(Boolean);
    if (!els.length) return;
    const obs = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) setActiveId(visible[0].target.id);
    }, { rootMargin: '-100px 0px -70% 0px', threshold: 0 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [guide.slug]);

  return (
    <div style={{ paddingTop: 128, paddingBottom: 88 }}>
      <div style={{ maxWidth: 1760, margin: '0 auto', padding: '0 6%' }}>

        <a href="/guides" onClick={e => { if (plainClick(e)) { e.preventDefault(); onClose(); } }}
          className="quiet-link quiet-link-dim" style={{ marginBottom: 26 }}>
          <span aria-hidden="true" style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}><ChevronRight size={12} /></span>
          All guides
        </a>

        <div style={{ display: 'flex', gap: 30, alignItems: 'flex-start', flexWrap: compact ? 'wrap' : 'nowrap' }}>

          {/* left rail — no wrapping div around it: sticky's containing
              block is its own parent, and a wrapper sized to fit only
              the nav (its one child) gives the nav nowhere to travel
              before it has to stick. Direct flex-item, same as the
              chapter sidebar on the right, whose sticking this same way
              already worked. */}
          <ReaderNav slug={guide.slug} onOpen={onOpen} compact={compact} />

          {/* the guide */}
          {/* the id is what a link from Functions lands on; the margin
              leaves the way back out of the guide above the fold */}
          {/* With no rail on the right, the freed width goes to the
              guide — but to the guide's furniture (screens, tables, the
              checklist), not to its sentences: prose inside stays capped
              at COLUMN so a line never runs longer than the eye tracks.
              The auto side margins matter on a guide with no chapter
              sidebar (below): capped at READER_MAX with nothing beside
              it, the column would otherwise hug the left rail and leave
              the rest of the row empty on one side. */}
          <article id={'guide-' + guide.slug} style={{ flex: '1 1 420px', minWidth: 0, maxWidth: READER_MAX, margin: '0 auto', scrollMarginTop: 150 }}>
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
            <p style={{ ...readerProse, marginBottom: 6 }}>
              {guide.summary}
            </p>

            {/* chapters — the map of the page, and the slots screens land in.
                A written guide's own chapter list lives in the sticky
                sidebar once there is room for one (below); here it only
                falls back inline when that sidebar isn't showing —
                compact widths, or a module guide with no `body` at all,
                which still gets its plain "what this covers" list. */}
            {(compact || !guide.body) && <ReaderHeading>In this guide</ReaderHeading>}
            {guide.body ? (
              compact && (
                /* A written guide's chapters are its own sections, so the
                   list is also the way into them — real hrefs, so a copied
                   link lands on the section and not just on the page. */
                <div className="panel g-toc" style={{ padding: '16px 18px' }}>
                  <ChapterNav sections={guide.body} activeId={activeId} />
                </div>
              )
            ) : (
              <div className="panel" style={{ maxWidth: COLUMN + 40, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {guide.covers.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.62rem', color: `rgba(${GREEN_RGB},0.6)`, marginTop: 4, flexShrink: 0 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.95rem', color: '#fff', lineHeight: 1.6 }}>{c}</span>
                  </div>
                ))}
              </div>
            )}

            {guide.body && guide.body.map((s, i) => (
              <section key={s.id} id={s.id} style={{ scrollMarginTop: 108 }}>
                <ReaderHeading n={String(i + 1).padStart(2, '0')}>{s.title}</ReaderHeading>
                <ReaderBlocks blocks={s.blocks} onOpen={onOpen} />
              </section>
            ))}

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
                      <span style={{ display: 'block', fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.88rem', color: '#fff', lineHeight: 1.65 }}>{b}</span>
                    </div>
                  ))}
                </div>

                {mod.guard && (
                  <>
                    <ReaderHeading>Read this before you turn it up</ReaderHeading>
                    <div className="panel" style={{ maxWidth: COLUMN + 75, padding: '20px 22px', display: 'flex', gap: 14, alignItems: 'flex-start', borderColor: `rgba(${GREEN_RGB},0.3)` }}>
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

          {/* chapter sidebar: a third rail, sticky the same way the left
              one is — a sibling in this same flex row, so it can stay
              pinned for as long as the row (i.e. the article) is tall,
              not just for the height of whatever block it started next
              to. Only for a written guide, and only once there's room
              beside the text rather than under it. */}
          {guide.body && !compact && (
            <nav aria-label="Chapters" className="panel g-toc g-toc-side"
              style={{ flex: '0 0 220px', minWidth: 0, position: 'sticky', top: 92, padding: 12 }}>
              <span style={{ display: 'block', padding: '6px 10px 10px', fontFamily: MONO, fontWeight: 500, fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: `rgba(${GREEN_RGB},0.6)` }}>
                In this guide
              </span>
              <ChapterNav sections={guide.body} activeId={activeId} />
            </nav>
          )}
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
