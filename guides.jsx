
/* ══════════════════════════════════════════════════════════════════
   guides.jsx — the page that teaches.

   Two views, one page. The index is a wall of cards, one per
   guide, carrying a name and a handful of words — enough to choose
   from, never enough to read instead of opening. Clicking one opens
   the reader: every guide in a rail down the left, and the chosen one
   filling everything to the right of it. Nothing else — a page you
   came to read is not the place to sell you the next thing.

   The reader builds its body from catalog.jsx, section by section.
   There is no chapter list beside or above the text: the guides are
   short enough to read top to bottom, and every section heading still
   carries its id, so a link to /guides/<url>#<section> lands on it.

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
  ArrowUpRight, Play, BookOpen, ChevronRight,
  Pill, CrossLinks, FooterBar, SectionBadge, DecryptText,
  MONO, SERIF, GUIDES, GUIDE_FOLDERS, MODULE_BY_KEY, REDUCED_MOTION,
  TOOL_BY_ID,
  guideHref, guideFromPath, GUIDE_BY_SLUG, LiteVideo,
} = window;

const GREEN = window.ACCENT;
const GREEN_RGB = window.ACCENT_RGB;
const CONTACT = 'hello@atreox.ai';

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
   next re-render, and each one would silently put the failed <source>
   right back. */
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
   module's icon, the guide's short title and one line of what it is.
   No chapter count and no price — the index is for choosing what to
   read, and both were noise there. Small enough that all ten guides fit
   on one desktop screen. */
function GuideTile({ guide, index, inView, onOpen }) {
  const mod = guide.module ? MODULE_BY_KEY[guide.module] : null;
  const Icon = mod ? mod.icon : BookOpen;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: Math.min(index, 9) * 0.04 }}
      className="guide-tile-wrap">
      <a href={guideHref(guide)}
        onClick={e => { if (plainClick(e)) { e.preventDefault(); onOpen(guide.slug); } }}
        className="panel panel-hover ticks guide-tile"
        style={{
          width: '100%', textAlign: 'left', padding: '14px 15px',
          display: 'flex', alignItems: 'flex-start', gap: 11, background: 'transparent',
          textDecoration: 'none', color: 'inherit', cursor: 'pointer',
        }}>
        <span aria-hidden="true" className="guide-tile-chip" style={{
          width: 32, height: 32, borderRadius: 5, flexShrink: 0,
          background: `rgba(${GREEN_RGB},0.09)`, border: `1px solid rgba(${GREEN_RGB},0.26)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={15} color={GREEN} />
        </span>
        <span style={{ display: 'block', flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontFamily: SERIF, fontWeight: 500, fontSize: '1.02rem', color: 'white', lineHeight: 1.25, letterSpacing: '-0.005em', marginBottom: 4 }}>
            {guide.navTitle || guide.title}
          </span>
          <span style={{ display: 'block', fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.84rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
            {guide.short}
          </span>
        </span>
      </a>
    </motion.div>
  );
}

/* One folder: a small heading and its guides. auto-fill, not auto-fit,
   so a folder of two keeps card-sized cards instead of two banners, and
   the cards line up in the same columns from one folder to the next. */
function GuideGroup({ group, offset, onOpen }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.05 });
  return (
    <section ref={ref} style={{ marginTop: offset ? 26 : 0 }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, fontFamily: MONO, fontWeight: 500, fontSize: '0.66rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'white' }}>
        <span aria-hidden="true" style={{ color: GREEN }}>{'//'}</span>
        {group.title}
        <span aria-hidden="true" className="section-rule" style={{ flex: '1 1 24px', minWidth: 24 }} />
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(208px, 100%), 1fr))', gap: 10 }}>
        {group.guides.map((g, i) => (
          <GuideTile key={g.slug} guide={g} index={offset + i} inView={inView} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}

/* The index's own words at module scope, so scripts/prerender.mjs can
   put them in the HTML a crawler downloads. */
const HERO = {
  badge: 'Guides',
  title: 'Learn it once, then run it.',
  sub: 'Start with accounts and proxies, protect them, then open the guide for the module you run.',
};

const GROUPS = GUIDE_FOLDERS;

/* A shorter head than PageHero's: the page is a list to choose from, and
   PageHero's 170px + 84px of padding alone would push the last folder
   below the fold. */
function GuideIndex({ onOpen }) {
  return (
    <div>
      <header style={{ padding: '132px 5% 34px', textAlign: 'center' }}>
        <SectionBadge>{HERO.badge}</SectionBadge>
        <h1 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(2rem, 3.4vw, 2.8rem)', color: 'white', lineHeight: 1.1, letterSpacing: '-0.015em', margin: '18px 0 12px' }}>
          <DecryptText text={HERO.title} />
        </h1>
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.66)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6, textWrap: 'balance' }}>
          {HERO.sub}
        </p>
      </header>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 5% 64px' }}>
        {GROUPS.map((group, index) => (
          <GuideGroup key={group.id} group={group}
            offset={GROUPS.slice(0, index).reduce((n, f) => n + f.guides.length, 0)}
            onOpen={onOpen} />
        ))}
      </div>
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

/* One width, not two. This used to be a pair — a wide column for
   screens and tables, a narrower cap for prose inside it — and on a
   1920 screen that showed: figures ran to 1001px while paragraphs
   stopped at 790, leaving a 211px ragged strip down the right of every
   section. The cap is the one that has to stay (without it a line runs
   114-121 characters, well past what the eye tracks back from), so the
   column comes down to meet it instead and everything shares an edge.
   Below ~1250px viewport the column is narrower than this anyway and
   the number never comes into play. */
const COLUMN = 790;   /* pairs with --gcol in index.html */
const READER_MAX = COLUMN;

const readerProse = {
  fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1.2rem',
  color: '#fff', lineHeight: 1.8, maxWidth: COLUMN,
};

/* One control, drawn to look like the panel's own. Deliberately inert:
   no state, no handlers, no value that can change — a switch is drawn
   in whatever position the engine's default puts it and stays there.
   Anything that looked adjustable would be lying, since none of this
   reaches an API. Shape comes from `kind`, everything else is CSS. */
function ControlReplica({ c }) {
  switch (c.kind) {
    case 'toggle':
      return <span aria-hidden="true" className={'g-r-toggle' + (c.on ? ' is-on' : '')} />;
    case 'slider':
      return (
        <span aria-hidden="true" className="g-r-slider">
          <span className="g-r-slider-fill" style={{ width: (c.pct ?? 50) + '%' }} />
          <span className="g-r-slider-thumb" style={{ left: (c.pct ?? 50) + '%' }} />
        </span>
      );
    case 'select':
      return (
        <span aria-hidden="true" className="g-r-select">
          <span className="g-r-select-v">{c.value}</span>
          <span className="g-r-caret" />
        </span>
      );
    case 'field':
      return <span aria-hidden="true" className="g-r-field">{c.value}</span>;
    case 'tile':
      return (
        <span aria-hidden="true" className={'g-r-tile' + (c.tone ? ' t-' + c.tone : '')}>
          <span className="g-r-tile-n">{c.value}</span>
        </span>
      );
    case 'badge':
      return <span aria-hidden="true" className={'g-r-badge' + (c.tone ? ' t-' + c.tone : '')}>{c.value}</span>;
    case 'button':
    default:
      return <span aria-hidden="true" className={'g-r-btn' + (c.tone ? ' t-' + c.tone : '')}>{c.value || c.name}</span>;
  }
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

      /* The map of a module: its regions in panel order, each with what
         sits inside it. Not a nav — a floor plan, so someone reading
         the guide can find the thing being described. */
      case 'map':
        return (
          <ol key={i} className="g-map">
            {v.map((region, j) => (
              <li key={j}>
                <span className="g-map-n">{String(j + 1).padStart(2, '0')}</span>
                <span className="g-map-body">
                  <span className="g-map-name">{region.name}</span>
                  <span className="g-map-holds">{region.holds}</span>
                </span>
              </li>
            ))}
          </ol>
        );

      /* Replicas of the panel's own controls: one console per block,
         each row a <details> whose summary holds the control drawn on
         its own dashed stage. Two things this is deliberately not: it
         is not live (no state, no handlers, no requests — the replicas
         are CSS, drawn once in whatever the panel's default is) and it
         is not the delivery mechanism for the text. Every row of every
         explanation is in the markup from the start; <details> only
         folds it, so the static page a crawler reads carries the whole
         thing and the interactivity is the layer on top. */
      case 'controls':
        return (
          <div key={i} className="g-ctl">
            <p className="g-ctl-warn">
              <span className="g-ctl-warn-badge">Illustration</span>
              <span className="g-ctl-warn-text">
                Not the live panel — nothing here is connected: no state, no saving,
                no requests. Click a control to read what it does.
              </span>
            </p>
            {v.map((c, j) => (
              <details key={j} className="g-ctl-item" id={c.id}>
                <summary>
                  <span className="g-ctl-stage"><ControlReplica c={c} /></span>
                  <span className="g-ctl-label">
                    <span className="g-ctl-name">{c.name}</span>
                    {c.where && <span className="g-ctl-where">{c.where}</span>}
                  </span>
                  <span className="g-ctl-plus" aria-hidden="true" />
                </summary>
                <dl className="g-ctl-rows">
                  {c.rows.map(([k, val], m) => (
                    <div key={m}>
                      <dt>{k}</dt>
                      <dd>{val}</dd>
                    </div>
                  ))}
                </dl>
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

      /* The player is not on the page until it is asked for — see
         LiteVideo in shared.jsx for why, and for what is verified about
         it. The class names come from index.html, like every other
         block, so this and prerender.mjs cannot drift. */
      case 'video':
        return (
          <LiteVideo
            key={i}
            id={v.id}
            title={v.title}
            poster={v.poster}
            caption={v.caption}
            note={v.note}
          />
        );

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

      /* A paragraph with links on words: an array of strings and
         { text, href, rel } parts. rel "sponsored" marks a paid link to
         search engines; the disclosure itself must be in the text of the
         same paragraph, which is where a reader sees it. */
      case 'plink':
        return (
          <p key={i} className="g-p">
            {v.map((part, j) => typeof part === 'string' ? part : (
              <a key={j} className="g-inline" href={part.href}
                rel={['noopener', part.rel].filter(Boolean).join(' ')}
                target={part.href.startsWith('/go/') ? '_blank' : undefined}>
                {part.text}
              </a>
            ))}
          </p>
        );

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

      /* The block the blog's conversion runs through, and the reason
         it takes a tool ID rather than a URL: it stands in the middle
         and at the end of most articles, so an address written into
         the blocks themselves would be spelled dozens of times.
         TOOLS in catalog.jsx is the one place it lives.

         An unknown id renders nothing HERE and throws in the
         prerenderer, which is the same asymmetry every other kind has
         (see BLOCK_KINDS) - the build is what catches it, before a
         reader ever meets the gap.

         The link goes to the tool's PAGE on this site, not to the
         panel: a reader mid-article does not yet know what the tool
         is, and the panel opens on a sign-in screen, which asks for an
         account before anything has explained why. The page explains
         and leads on to the panel itself. A plain href with no
         onClick: the page is outside the reader, so this is a real
         navigation, not a slug the reader can open in place. */
      case 'toolcta': {
        const tool = TOOL_BY_ID[v.tool];
        if (!tool) return null;
        return (
          <aside key={i} className="g-toolcta">
            <span className="g-toolcta-kicker">Free tool</span>
            <span className="g-toolcta-name">{tool.name}</span>
            <p className="g-p g-toolcta-text">{v.angle || tool.blurb}</p>
            <a className="g-toolcta-cta" href={tool.page}>
              {tool.cta} <ArrowUpRight size={13} />
            </a>
          </aside>
        );
      }

      default:
        return null;
    }
  });
}

/* Folder buttons use native keyboard activation; closed contents are inert.
   Each rail has unique IDs because desktop and compact versions can coexist. */
function ReaderNav({ slug, onOpen, compact }) {
  const activeFolder = GUIDE_FOLDERS.find(f => f.guides.some(g => g.slug === slug))?.id || 'start';
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(() => ({ [activeFolder]: true }));
  const prefix = compact ? 'guide-mobile' : 'guide-desktop';
  useEffect(() => {
    setExpanded(previous => ({ ...previous, [activeFolder]: true }));
  }, [slug, activeFolder]);

  const list = GUIDE_FOLDERS.map(folder => {
    const isOpen = !!expanded[folder.id];
    const containsActive = folder.id === activeFolder;
    const panelId = `${prefix}-${folder.id}`;
    return (
      <section className={'guide-folder' + (containsActive ? ' has-active' : '')} key={folder.id}>
        <button type="button" className="guide-folder-toggle" aria-expanded={isOpen}
          aria-controls={panelId} id={`${panelId}-label`}
          onClick={() => setExpanded(previous => ({ ...previous, [folder.id]: !previous[folder.id] }))}>
          <BookOpen size={14} aria-hidden="true" />
          <span>{folder.title}</span>
          <span className="guide-folder-count" aria-hidden="true">{folder.guides.length}</span>
          <ChevronRight size={14} className="guide-folder-chevron" aria-hidden="true" />
        </button>
        <div id={panelId} className={'guide-folder-content' + (isOpen ? ' is-open' : '')}
          inert={isOpen ? undefined : ''} aria-hidden={!isOpen} aria-labelledby={`${panelId}-label`}>
          <div className="guide-folder-inner">
            <ul className="guide-folder-links">
              {folder.guides.map(g => (
                <li key={g.slug}>
                  <a href={guideHref(g)} aria-current={g.slug === slug ? 'page' : undefined}
                    className="guide-nav-item"
                    onClick={e => { if (plainClick(e)) { e.preventDefault(); setOpen(false); onOpen(g.slug); } }}>
                    {g.navTitle || g.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    );
  });
  const current = GUIDE_BY_SLUG[slug] || GUIDES[0];
  if (compact) return (
    <nav aria-label="Guides" className="guide-nav-compact">
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open}
        aria-controls={`${prefix}-folders`} className="panel ticks guide-picker">
        <BookOpen size={16} color={GREEN} aria-hidden="true" />
        <span className="guide-picker-label">
          <span className="guide-picker-kicker">{'// '}Guides</span>
          <span className="guide-picker-name">{current.navTitle || current.title}</span>
        </span>
        <span aria-hidden="true" className={'guide-picker-chevron' + (open ? ' is-open' : '')}><ChevronRight size={15} /></span>
      </button>
      {open && <div id={`${prefix}-folders`} className="guide-nav-folders is-compact">{list}</div>}
    </nav>
  );
  return <nav aria-label="Guides" className="guide-nav-folders is-desktop">{list}</nav>;
}

function GuideReader({ slug, onOpen, onClose }) {
  const guide = GUIDES.find(g => g.slug === slug) || GUIDES[0];
  const mod = guide.module ? MODULE_BY_KEY[guide.module] : null;
  const [compact, setCompact] = useState(window.innerWidth < 1040);

  useEffect(() => {
    const onResize = () => setCompact(window.innerWidth < 1040);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div style={{ paddingTop: 128, paddingBottom: 88 }}>
      {/* One centred group, rail + article, at the same 1280 cap as every
          other page. There used to be a chapter sidebar on the right as
          well; with it gone the article sits beside the rail instead of
          floating in the middle of a 1760px row with empty space on both
          sides. The article itself keeps the reading measure (COLUMN). */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 5%' }}>

        <a href="/guides" onClick={e => { if (plainClick(e)) { e.preventDefault(); onClose(); } }}
          className="quiet-link quiet-link-dim" style={{ marginBottom: 26 }}>
          <span aria-hidden="true" style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}><ChevronRight size={12} /></span>
          All guides
        </a>

        <div style={{ display: 'flex', gap: compact ? 30 : 48, alignItems: 'flex-start', justifyContent: 'center', flexWrap: compact ? 'wrap' : 'nowrap' }}>

          {/* left rail — no wrapping div around it: sticky's containing
              block is its own parent, and a wrapper sized to fit only
              the nav (its one child) gives the nav nowhere to travel
              before it has to stick. */}
          <ReaderNav slug={guide.slug} onOpen={onOpen} compact={compact} />

          {/* the guide */}
          {/* the id is what a link from Functions lands on; the margin
              leaves the way back out of the guide above the fold */}
          {/* Capped at READER_MAX so a line never runs longer than the
              eye tracks; on compact widths, where the rail is a picker
              above it, the auto margins centre it. */}
          <article id={'guide-' + guide.slug} style={{ flex: '1 1 420px', minWidth: 0, maxWidth: READER_MAX, margin: compact ? '0 auto' : 0, scrollMarginTop: 150 }}>
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

            {/* No chapter list, at any width: the section headings carry
                their ids (below), so a copied #anchor still lands on its
                section. A module guide with no `body` yet still lists what
                it covers, since that list is its only outline. */}
            {!guide.body && guide.covers && (
              <>
                <ReaderHeading>In this guide</ReaderHeading>
                <div className="panel" style={{ maxWidth: COLUMN, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {guide.covers.map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.62rem', color: `rgba(${GREEN_RGB},0.6)`, marginTop: 4, flexShrink: 0 }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.95rem', color: '#fff', lineHeight: 1.6 }}>{c}</span>
                    </div>
                  ))}
                </div>
              </>
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

            <div style={{ marginTop: 44, paddingTop: 22, borderTop: `1px solid rgba(${GREEN_RGB},0.14)`, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.92rem', color: 'rgba(255,255,255,0.55)' }}>
                Something here not clear enough?
              </span>
              <a href={`mailto:${CONTACT}?subject=Guide%3A%20${encodeURIComponent(guide.title)}`} className="quiet-link">
                Tell us and we'll fix it <ArrowUpRight size={12} />
              </a>
            </div>
          </article>

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

Object.assign(window, { GuidesPage, ReaderBlocks, ReaderHeading });

/* ── The same words, as data, for scripts/prerender.mjs ───────────
   The guide list comes from GUIDES in catalog.jsx, and every address
   from guideHref — the one place a guide's address is spelled. So the
   hub's prerendered body cannot list a guide that does not exist or
   point at one by the wrong path. */
(window.PAGE_COPY || (window.PAGE_COPY = {}))['/guides'] = {
  kicker: HERO.badge,
  h1: HERO.title,
  lead: HERO.sub,
  sections: GROUPS.map((g) => ({
    title: g.title,
    blocks: g.guides.map((x) => ['card', { kicker: x.short, blocks: [
      ['p', x.summary],
      ['linkout', { href: guideHref(x), label: x.navTitle || x.title }],
    ] }]),
  })),
};
