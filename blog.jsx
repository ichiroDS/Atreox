
/* ══════════════════════════════════════════════════════════════════
   blog.jsx — /blog, /blog/category/<slug> and /blog/<slug>.

   Three views, one page, the same shape guides.jsx uses: the URL says
   which one, and every link is a real <a href> pointing at a file
   scripts/prerender.mjs writes at build time. The clicks are
   intercepted so the view swaps in place, but nothing here depends on
   that — a middle click, a copied link and a crawler running no
   JavaScript all land on a real page.

   THE BLOCK RENDERER IS NOT REIMPLEMENTED HERE. ReaderBlocks comes off
   window, exported by guides.jsx, so an article and a guide render a
   paragraph, a table or a tool block through the same function object
   rather than through two copies that agree today. The same goes for
   ChapterNav, which is the contents rail on the left.

   The reader layout mirrors GuideReader: contents sticky on one side,
   the article filling the rest, and nothing else on the page — a page
   somebody came to read is not the place to sell them the next thing.
   The one exception is the tool block, which is not a sale sitting
   beside the text but the answer to the problem the text is about.
══════════════════════════════════════════════════════════════════ */

const React = window.React;
const { useState, useEffect } = React;
const {
  SectionLockup, FooterBar, MONO, SERIF,
  BLOG_CATEGORIES, BLOG_CATEGORY_BY_SLUG,
  postHref, blogCategoryHref, postFromPath, blogCategoryFromPath,
  postsForList, relatedPosts, formatPostDate, postWasUpdated,
  ReaderBlocks, ChapterNav, ReaderHeading,
} = window;

const ACCENT = window.ACCENT;

/* Same rule as guides.jsx: a plain left click is ours, anything else —
   middle click, a modifier, the context menu — belongs to the browser,
   and the href underneath is a real address. */
const plainClick = e =>
  !e.defaultPrevented && e.button === 0 &&
  !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

/* Which of the three views the current URL is asking for. Order
   matters: /blog/category/<slug> has to be tested before /blog/<slug>,
   because the second pattern would otherwise match the first segment
   of the first. blog-catalog.jsx also refuses to build a post slugged
   "category", so the two can never collide from the other direction. */
function viewFromPath(pathname) {
  const category = blogCategoryFromPath(pathname);
  if (category) return { kind: 'category', category };
  const post = postFromPath(pathname);
  if (post) return { kind: 'post', post };
  return { kind: 'index' };
}

/* ── The breadcrumb trail ──────────────────────────────────────────
   Blog → Rubric → Article, matching the BreadcrumbList in the page's
   JSON-LD exactly. They are built from the same data on purpose: a
   crumb trail that says something different from its own markup is
   worse than having neither. */
function Breadcrumbs({ trail, onNavigate }) {
  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: 22 }}>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {trail.map((c, i) => {
          const last = i === trail.length - 1;
          const style = {
            fontFamily: MONO, fontWeight: 500, fontSize: '0.6rem',
            letterSpacing: '0.16em', textTransform: 'uppercase', textDecoration: 'none',
            color: last ? 'rgba(255,255,255,0.5)' : ACCENT,
          };
          return (
            <li key={c.href || c.name} style={{ display: 'inline' }}>
              {last
                ? <span style={style} aria-current="page">{c.name}</span>
                : <a href={c.href} style={style}
                    onClick={e => { if (plainClick(e)) { e.preventDefault(); onNavigate(c.href); } }}>
                    {c.name}
                  </a>}
              {!last && (
                <span aria-hidden="true" style={{ ...style, color: 'rgba(255,255,255,0.28)', padding: '0 8px' }}>/</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ── One row in a list ─────────────────────────────────────────── */
function PostCard({ post, onNavigate }) {
  const category = BLOG_CATEGORY_BY_SLUG[post.category];
  const href = postHref(post);
  return (
    <li style={{ margin: '0 0 2px' }}>
      <a href={href} className="g-postcard"
        onClick={e => { if (plainClick(e)) { e.preventDefault(); onNavigate(href); } }}>
        <span className="g-postcard-cat">{category ? category.name : 'Blog'}</span>
        <span className="g-postcard-title">{post.title}</span>
        <span className="g-postcard-sum">{post.summary}</span>
        <time className="g-postcard-date" dateTime={post.published}>
          {formatPostDate(post.published)}
        </time>
      </a>
    </li>
  );
}

/* The category rail, on the index and on every category page, so any
   one of them reaches all the others in a single hop. */
function CategoryRail({ activeSlug, onNavigate }) {
  return (
    <nav aria-label="Categories" style={{ margin: '0 0 30px' }}>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {BLOG_CATEGORIES.map(c => {
          const href = blogCategoryHref(c);
          return (
            <li key={c.slug}>
              <a href={href} className="g-postcat"
                aria-current={c.slug === activeSlug ? 'true' : undefined}
                onClick={e => { if (plainClick(e)) { e.preventDefault(); onNavigate(href); } }}>
                {c.name}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ── The list views ───────────────────────────────────────────────
   `posts` arrives as a slice from postsForList, already sorted and
   already cut. Adding pagination later means passing a page number
   there and rendering a nav under this list — nothing in here changes,
   which is the whole reason the list is fed a slice rather than
   filtering the array itself.
─────────────────────────────────────────────────────────────────── */
function PostList({ heading, lead, posts, activeCategory, crumbs, onNavigate }) {
  return (
    <div style={{ paddingTop: 128, paddingBottom: 88 }}>
      <div style={{ maxWidth: 1340, margin: '0 auto', padding: '0 6%' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          {crumbs && crumbs.length > 1 && <Breadcrumbs trail={crumbs} onNavigate={onNavigate} />}
          <h1 style={{
            fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(2.1rem, 4vw, 2.6rem)',
            lineHeight: 1.1, letterSpacing: '-0.015em', color: '#fff', margin: '0 0 16px',
          }}>{heading}</h1>
          <p style={{
            fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1.05rem',
            color: 'rgba(255,255,255,0.78)', lineHeight: 1.75, margin: '0 0 30px',
          }}>{lead}</p>

          <CategoryRail activeSlug={activeCategory} onNavigate={onNavigate} />

          {posts.length ? (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {posts.map(p => <PostCard key={p.slug} post={p} onNavigate={onNavigate} />)}
            </ul>
          ) : (
            <p className="g-p">Nothing here yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── The article ──────────────────────────────────────────────────
   Same skeleton as GuideReader: a sticky contents rail beside the
   text, a scrollspy that tracks the section actually being read, and
   the body rendered by the shared ReaderBlocks.
─────────────────────────────────────────────────────────────────── */
function PostReader({ post, onNavigate }) {
  const category = BLOG_CATEGORY_BY_SLUG[post.category];
  const [compact, setCompact] = useState(typeof window !== 'undefined' && window.innerWidth < 1040);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const onResize = () => setCompact(window.innerWidth < 1040);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* The section nearest the top of a band just under the sticky header,
     so the rail tracks what is being read rather than whatever merely
     touched the viewport. Identical rule to the guide reader's. */
  useEffect(() => {
    const els = post.body.map(s => document.getElementById(s.id)).filter(Boolean);
    if (!els.length) return;
    const obs = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) setActiveId(visible[0].target.id);
    }, { rootMargin: '-100px 0px -70% 0px', threshold: 0 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [post.slug]);

  const related = relatedPosts(post);

  return (
    <div style={{ paddingTop: 128, paddingBottom: 88 }}>
      <div style={{ maxWidth: 1340, margin: '0 auto', padding: '0 6%' }}>
        <div style={{ display: 'flex', gap: 34, alignItems: 'flex-start', flexWrap: compact ? 'wrap' : 'nowrap' }}>

          <article style={{ minWidth: 0, flex: '1 1 auto', maxWidth: 860 }}>
            <Breadcrumbs
              trail={[
                { name: 'Blog', href: '/blog' },
                { name: category ? category.name : 'Blog', href: blogCategoryHref(post.category) },
                { name: post.title },
              ]}
              onNavigate={onNavigate}
            />

            <h1 style={{
              fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(2.1rem, 4vw, 2.6rem)',
              lineHeight: 1.1, letterSpacing: '-0.015em', color: '#fff', margin: '0 0 16px',
            }}>{post.title}</h1>

            {/* Published always; Updated only when the article really has
                been revised — blog-catalog.jsx leaves `updated` unset
                until then, so there is nothing to hide here. */}
            <p className="g-postmeta">
              <time dateTime={post.published}>Published {formatPostDate(post.published)}</time>
              {postWasUpdated(post) && (
                <>
                  <span aria-hidden="true" className="g-postmeta-sep">·</span>
                  <time dateTime={post.updated}>Updated {formatPostDate(post.updated)}</time>
                </>
              )}
            </p>

            <p style={{
              fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1.05rem',
              color: 'rgba(255,255,255,0.78)', lineHeight: 1.75, margin: '0 0 30px',
            }}>{post.summary}</p>

            {/* The same heading component the guide reader uses, and the
                anchor on the <section> exactly where it puts it, so a
                deep link behaves identically in both. */}
            {post.body.map((s, i) => (
              <section key={s.id} id={s.id} style={{ scrollMarginTop: 108 }}>
                <ReaderHeading n={String(i + 1).padStart(2, '0')}>{s.title}</ReaderHeading>
                <ReaderBlocks blocks={s.blocks} />
              </section>
            ))}

            {related.length > 0 && (
              <div style={{ marginTop: 44 }}>
                <SectionLockup title="Read next" />
                <div className="g-toc panel" style={{ padding: '16px 18px' }}>
                  {related.map(r => {
                    const href = postHref(r);
                    return (
                      <a key={r.slug} href={href}
                        onClick={e => { if (plainClick(e)) { e.preventDefault(); onNavigate(href); } }}>
                        <span className="g-toc-t">{r.title}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </article>

          {/* The contents rail. A direct flex item, not wrapped: sticky's
              containing block is its own parent, and a wrapper sized to
              fit only the rail would give it nowhere to travel before it
              had to stick — the same note GuideReader carries. */}
          {!compact && post.body.length > 1 && (
            <nav aria-label="Contents"
              style={{ position: 'sticky', top: 108, width: 250, flex: '0 0 250px' }}>
              <span style={{
                display: 'block', fontFamily: MONO, fontWeight: 500, fontSize: '0.6rem',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.34)', marginBottom: 12,
              }}>In this article</span>
              <div className="g-toc g-toc-side panel" style={{ padding: '10px 12px' }}>
                <ChapterNav sections={post.body} activeId={activeId} />
              </div>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── The page ─────────────────────────────────────────────────────
   One component for all three views, because they share a URL space
   and the router hands this page any /blog* address. Navigating
   between them is a pushState plus a state change, the same way the
   guide reader swaps guides.
─────────────────────────────────────────────────────────────────── */
function BlogPage({ setPage }) {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const sync = () => setPath(window.location.pathname);
    window.addEventListener('popstate', sync);
    /* app.jsx fires this after a pushState of its own, which is how a
       navbar click into /blog reaches a page that is already mounted. */
    window.addEventListener('atreox:navigate', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('atreox:navigate', sync);
    };
  }, []);

  const navigate = href => {
    history.pushState({ page: 'blog' }, '', href);
    setPath(href);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const view = viewFromPath(path);

  let content;
  if (view.kind === 'post') {
    content = <PostReader post={view.post} onNavigate={navigate} />;
  } else if (view.kind === 'category') {
    content = (
      <PostList
        heading={view.category.name}
        lead={view.category.blurb}
        posts={postsForList({ category: view.category.slug }).items}
        activeCategory={view.category.slug}
        crumbs={[{ name: 'Blog', href: '/blog' }, { name: view.category.name }]}
        onNavigate={navigate}
      />
    );
  } else {
    content = (
      <PostList
        heading="Blog"
        lead="What we have learned running Telegram accounts at scale, written for the questions people actually search for."
        posts={postsForList().items}
        activeCategory={null}
        crumbs={[{ name: 'Blog' }]}
        onNavigate={navigate}
      />
    );
  }

  return (
    <div>
      {content}
      <div style={{ padding: '0 5% 64px' }}><FooterBar setPage={setPage} /></div>
    </div>
  );
}

Object.assign(window, { BlogPage });
