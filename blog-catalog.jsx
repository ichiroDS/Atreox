
/* ══════════════════════════════════════════════════════════════════
   blog-catalog.jsx — the articles, their categories, and the helpers
   that turn either into an address.

   WHY THIS IS NOT IN catalog.jsx. That file is already 3,400 lines of
   guides and modules, and the blog is the half of the site that grows
   without limit — one file holding both would be unreadable inside a
   month. The split is by lifecycle, not by taste: guides describe the
   product and change when the product does; articles are written for
   search and only ever accumulate.

   WHAT IS THE SAME, DELIBERATELY. An article's `body` is the exact
   shape a guide's is — sections of [kind, value] blocks — and both go
   through the same two renderers (ReaderBlocks in guides.jsx,
   renderBlocks in scripts/prerender.mjs). There is no second block
   engine and no article-only block kind: `toolcta` was added to the
   shared list and works in a guide too. A second renderer would drift
   from the first within a release, and the guides are the half that
   customers pay for.

   Every field below is read at build time by scripts/prerender.mjs,
   which writes one static HTML page per article, one per category, and
   the index. This file stays the only place the text lives.

   ── An article ──────────────────────────────────────────────────
   `slug`       its address, /blog/<slug>. Never renamed once published:
                a renamed slug is a dead link everywhere it was shared.
   `category`   a slug from BLOG_CATEGORIES below.
   `title`      the <h1>, and the card title on the index.
   `summary`    one sentence under the title; also the card's body and
                the meta description when seoDescription is absent.
   `seoTitle`, `seoDescription`
                what a search result says, when the on-page title is
                not the best sentence for a result. Both optional.
   `published`  ISO date, YYYY-MM-DD. Required.
   `updated`    ISO date. OPTIONAL, and deliberately absent until the
                article is actually revised — see BOTH DATES below.
   `body`       sections, each { id, title, blocks }. `id` is the
                anchor the sidebar contents links to, and a public
                address, so it is chosen once and left alone.

   ── BOTH DATES, AND WHY `updated` IS MISSING BY DEFAULT ─────────
   The page shows "Published" always and "Updated" only when `updated`
   is set AND differs from `published`. Defaulting `updated` to the
   publication date would put an "Updated" line on every article on the
   day it was written, which says nothing and trains the reader to
   ignore the one place it will eventually matter. `dateModified` in
   the JSON-LD falls back to `published` for the same reason: the field
   must be present for the markup to be complete, but nothing on the
   page claims a revision that did not happen.
══════════════════════════════════════════════════════════════════ */

/* ── Categories ───────────────────────────────────────────────────
   Kept few on purpose. A category with two articles in it is a page
   that ranks for nothing and gives a reader nothing to browse; the
   list grows when the articles do, not in anticipation.
─────────────────────────────────────────────────────────────────── */
const BLOG_CATEGORIES = [
  {
    slug: 'accounts-and-proxies',
    name: 'Accounts & proxies',
    blurb: 'Buying accounts, matching proxies to them, and telling a usable one from one that will die in a week.',
    seoTitle: 'Telegram accounts and proxies — ATREOX blog',
    seoDescription:
      'Articles on buying Telegram accounts, checking them before you pay, matching proxies to account geo, and the checks that catch a dead account early.',
  },
];

const BLOG_CATEGORY_BY_SLUG = Object.fromEntries(BLOG_CATEGORIES.map(c => [c.slug, c]));

/* ── Articles ─────────────────────────────────────────────────────
   PLACEHOLDER ONLY. The one entry below exists to show the layout —
   the header with its dates, the sidebar contents, a tool call-to-
   action in the middle and at the end, and the read-next rail. Its
   text is scaffolding and says so; it is meant to be overwritten by
   the real article on the same subject, not extended.
─────────────────────────────────────────────────────────────────── */
const POSTS = [
  {
    slug: 'how-to-check-telegram-account-before-buying',
    category: 'accounts-and-proxies',
    title: 'How to check a Telegram account before buying',
    summary:
      'Placeholder article — the real text is being written. This entry exists so the layout, the dates, the contents rail and the tool block can be seen on a real page.',
    seoTitle: 'How to check a Telegram account before buying',
    seoDescription:
      'Placeholder description. Replace this with the real one before the article is published.',
    published: '2026-08-29',
    /* No `updated` key at all, on purpose: this is the case the
       template has to handle, and the only way to see that it does is
       to have an article that has genuinely never been revised. */
    /* Two sections rather than one, and that is not padding: the
       contents rail only appears for an article with more than one
       section, so a single-section placeholder would hide the very
       layout it exists to show. */
    body: [
      {
        id: 'placeholder',
        title: 'Placeholder',
        blocks: [
          ['p', "This is placeholder text. It is here to give the article template something to lay out — a heading, a few paragraphs, and the blocks below — and it will be replaced wholesale by the real article. Nothing in it should be read as advice."],
          ['p', "The section heading above is a real anchor, so it appears in the contents rail on the left and a link to it works before any JavaScript has run. A real article will have several of these, and they are what the rail is for."],
          ['toolcta', {
            tool: 'proxy-checker',
            angle: 'A tool block in the middle of an article, where a reader has just met the problem it solves.',
          }],
        ],
      },
      {
        id: 'second-placeholder-section',
        title: 'Second placeholder section',
        blocks: [
          ['p', "A second section, so the contents rail on the left has two entries to show and the scrollspy has something to track. The block below is the same tool block with no `angle` set, which is how it reads when an article does not override the pitch — this is the end-of-article position."],
          ['toolcta', { tool: 'proxy-checker' }],
        ],
      },
    ],
  },
];

const POST_BY_SLUG = Object.fromEntries(POSTS.map(p => [p.slug, p]));

/* ── Addresses ────────────────────────────────────────────────────
   The one place a blog address is spelled, for the same reason
   guideHref exists: the index, the category pages, the read-next rail,
   the router and the sitemap all go through here, so a route and the
   file the build writes for it can never disagree.

   `category` is a RESERVED first segment under /blog. Without that,
   /blog/category would be ambiguous the day someone writes an article
   whose slug is "category"; prerender.mjs refuses to build such a slug
   rather than leaving it to be discovered as a 404 later.
─────────────────────────────────────────────────────────────────── */
const BLOG_RESERVED_SLUGS = ['category'];

const postHref = p => {
  const post = typeof p === 'string' ? POST_BY_SLUG[p] : p;
  return post ? '/blog/' + post.slug : '/blog';
};

const blogCategoryHref = c => {
  const cat = typeof c === 'string' ? BLOG_CATEGORY_BY_SLUG[c] : c;
  return cat ? '/blog/category/' + cat.slug : '/blog';
};

const postFromPath = pathname => {
  const m = /^\/blog\/([^/?#]+)\/?$/.exec(pathname || '');
  if (!m) return null;
  let seg = m[1];
  try { seg = decodeURIComponent(seg); } catch (_) {}
  if (BLOG_RESERVED_SLUGS.indexOf(seg) !== -1) return null;
  return POST_BY_SLUG[seg] || null;
};

const blogCategoryFromPath = pathname => {
  const m = /^\/blog\/category\/([^/?#]+)\/?$/.exec(pathname || '');
  if (!m) return null;
  let seg = m[1];
  try { seg = decodeURIComponent(seg); } catch (_) {}
  return BLOG_CATEGORY_BY_SLUG[seg] || null;
};

/* ── The list, and the shape pagination will need ─────────────────
   Returns a SLICE from the first call, with defaults that happen to
   include everything. That is the whole preparation for pagination:
   adding it later means passing a `page` and rendering a nav, with no
   change to this function's shape, to the card component, or to the
   data.

   The sort is what actually matters. Newest first, with the slug as a
   tie-break, so the order is TOTAL — two articles published the same
   day can never swap places between two renders. An unstable sort is
   invisible until the day a list is cut into pages, and then it shows
   up as an article that appears on both page one and page two, or on
   neither.
─────────────────────────────────────────────────────────────────── */
function postsForList({ category = null, page = 1, perPage = Infinity } = {}) {
  const all = POSTS
    .filter(p => !category || p.category === category)
    .slice()
    .sort((a, b) =>
      a.published === b.published
        ? (a.slug < b.slug ? -1 : 1)
        : (a.published < b.published ? 1 : -1));

  const total = all.length;
  const pages = perPage === Infinity ? 1 : Math.max(1, Math.ceil(total / perPage));
  const start = perPage === Infinity ? 0 : (page - 1) * perPage;
  const items = perPage === Infinity ? all : all.slice(start, start + perPage);
  return { items, total, page, pages, perPage };
}

/* Read next: same category first, then anything else, never itself.
   Falls through to the newest articles rather than showing an empty
   rail, because a category with one article in it is the normal state
   of a young blog and an empty "read also" reads like a bug. */
function relatedPosts(post, limit = 3) {
  const sameCategory = postsForList({ category: post.category }).items
    .filter(p => p.slug !== post.slug);
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);
  const rest = postsForList().items
    .filter(p => p.slug !== post.slug && sameCategory.indexOf(p) === -1);
  return sameCategory.concat(rest).slice(0, limit);
}

/* ── Dates, as the page and the markup both need them ──────────────
   One formatter so the header, the cards and the JSON-LD can never
   disagree about what a date says. `en-GB` explicitly rather than the
   visitor's locale: the site is English-only by decision (see the
   blog's own README note), and a date that renders differently for
   different readers is a difference nothing on the page accounts for.
─────────────────────────────────────────────────────────────────── */
const BLOG_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatPostDate = iso => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  if (!m) return String(iso || '');
  return `${Number(m[3])} ${BLOG_MONTHS[Number(m[2]) - 1]} ${m[1]}`;
};

/* True only when the article has actually been revised. Both the
   visible "Updated" line and the JSON-LD read this one predicate, so
   the page and the markup cannot tell different stories. */
const postWasUpdated = post => Boolean(post.updated) && post.updated !== post.published;

Object.assign(window, {
  BLOG_CATEGORIES, BLOG_CATEGORY_BY_SLUG, BLOG_RESERVED_SLUGS,
  POSTS, POST_BY_SLUG,
  postHref, blogCategoryHref, postFromPath, blogCategoryFromPath,
  postsForList, relatedPosts, formatPostDate, postWasUpdated,
});
