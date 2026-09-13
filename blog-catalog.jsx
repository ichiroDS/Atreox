
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
   `draft`      OPTIONAL. `true` keeps the entry — and its slug — while
                publishing nothing: no page, no sitemap entry, no card,
                no route. See the block above PUBLISHED_POSTS below.
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
    slug: 'telegram-account-aging-claims-tested',
    category: 'accounts-and-proxies',
    title: 'Telegram account aging: does the seller\u2019s claim predict survival?',
    summary:
      'We bought two Argentine batches on the same day from different sellers. '
      + 'One advertised thirty days of aging, the other claimed nothing we '
      + 'recorded. Seven days later the aged batch was the dead one.',
    seoTitle: 'Telegram account aging tested \u2014 does the seller\u2019s claim predict survival?',
    seoDescription:
      'Two Argentine Telegram account batches, same day, different sellers, one '
      + 'claiming 30 days of aging. Day-7 survival counts, sellers named, and '
      + 'what the numbers do not prove.',
    published: '2026-09-14',
    body: [
      {
        id: 'what-we-measured',
        title: 'What we measured, and why it is a question at all',
        blocks: [
          ['p', "Aging is the main thing a Telegram account seller charges for. The listing says the accounts sat untouched for two weeks, or thirty days, or three months, and the price moves with that number. It is the one variable buyers are trained to compare, and the one nobody publishes a result for."],
          ['p', "We could not find a single seller, reseller or marketplace that had put a rest-time claim next to a measured survival figure. Not a favourable one, not an unfavourable one. So we bought two batches specifically to see whether the claim predicts anything, and we are publishing what came back, with the sellers named."],
          ['p', "The short version is at the top of the table below: it predicted nothing. In our two batches it pointed the wrong way."],
        ],
      },
      {
        id: 'method',
        title: 'How this was set up, before the numbers',
        blocks: [
          ['p', "Two Argentine batches, bought on the same day from two sellers. Same country, same import day, same proxy provider and the same sticky-session configuration on both, same warmup settings. The one variable we deliberately did not hold constant is the one being tested: what the seller told us about rest time."],
          ['p', "theblja recorded thirty days of aging against both of its imports. AbonTg recorded nothing on two of its three imports and the literal word \u201cno\u201d on the third. Both are seller claims. We have never verified an aging figure and are not claiming to have verified one here \u2014 what this separates is what we were told, not what is true."],
          ['p', "A third batch, Uzbek stock from a different seller on a different day, is included because it is the other purchase we had running on the same measurement. It is context, not a control."],
          ['callout', [
            'What counts as survived',
            'An account survived if it passes a capability check on the measurement day: it resolves a known-good public username, reads that channel\u2019s history, searches it, and is not marked frozen, write-banned or unable to resolve. The check is the same one the engine runs before it will use an account for anything, so the bar is \u201cusable\u201d, not \u201cexists\u201d.',
            'A verdict older than seven days is not counted as a survival or as a death. It goes in its own column and the batch is reported as having no current answer for that account, which is why the columns below do not always add to the batch size in the way you would expect.',
          ]],
        ],
      },
      {
        id: 'results',
        title: 'Day 7, with the sellers named',
        blocks: [
          ['table', {
            head: ['Batch', 'Seller', 'Aging claimed', 'Can still post', 'Dead', 'No answer'],
            rows: [
              ['Argentina', 'AbonTg', 'none recorded', '49 of 50', '0 of 50', '1 of 50'],
              ['Argentina', 'theblja', '30 days', '2 of 30', '28 of 30', '0 of 30'],
              ['Uzbekistan', '\u041B\u0423\u0427\u0428\u0418\u0415_\u0410\u041A\u041A\u0410\u0423\u041D\u0422\u042B', 'none recorded', '20 of 20', '0 of 20', '0 of 20'],
            ],
          }],
          ['p', "All 28 of 30 dead accounts in the theblja batch came back with the same verdict from our check: frozen. Not write-restricted, not slow, not unreachable \u2014 frozen, which is Telegram\u2019s own account-level restriction and the end of the account for our purposes."],
          ['p', "Counts, not percentages, on purpose. Thirty accounts rendered as a percentage reads like a statistic and invites being compared against somebody\u2019s thousand. It is thirty accounts. The fraction says so and a percentage hides it."],
          ['note', "The one AbonTg account in the \u201cno answer\u201d column is ours, not the seller\u2019s: its check did not complete, so we have no current verdict for it. It is counted in the batch of 50 rather than dropped, because dropping the accounts you could not measure is how a survival figure flatters itself."],
          ['note', "Seller names are reproduced exactly as they appear on the marketplace listing, including the Uzbek seller\u2019s Cyrillic one. Transliterating it would make the name our rendering of the listing rather than the listing, and a reader checking our results against the marketplace needs the string that is actually there."],
        ],
      },
      {
        id: 'why-not-coincidence',
        title: 'Why this is not simply two batches differing',
        blocks: [
          ['p', "The two Argentine batches were bought on the same day, in the same country, put behind the same kind of proxy with the same sticky-session setting, and given the same warmup configuration. If rest time were the variable that decides survival, the batch with thirty days behind it should have been the one still standing."],
          ['p', "It was the other way round, and not marginally. Of the batch with no aging claim we could still post from 49 of 50 accounts, having lost none at all to Telegram. Of the batch sold on thirty days of rest, 28 of 30 were frozen inside the week and we could post from 2 of 30."],
          ['p', "There is one difference between the two batches beyond the aging claim, and it is worth naming because it runs against the conclusion rather than for it. 20 of the 50 AbonTg accounts had a profile change applied to them three days before the measurement \u2014 a write Telegram sees, and the kind of action that surfaces a flagged account. None of the theblja accounts was ever asked to do anything at all. The batch that was handled more is the batch that survived; the batch that was left completely alone is the one that froze."],
        ],
      },
      {
        id: 'what-this-does-not-prove',
        title: 'What these numbers do not prove',
        blocks: [
          ['p', "This is survival at rest, and that is a weaker thing than it sounds. A pre-flagged account does not announce itself while it sits; it surfaces when it is used. At the moment these verdicts were taken, no account in any of the three batches had posted a comment. Surviving a week untouched means not yet disproven. It does not mean good."],
          ['p', "So the AbonTg half of this is the weaker half. Our 49 of 50 still alive is a batch that has not failed yet, measured before it was really asked to do anything. We would not buy on that number and we are not asking anybody else to."],
          ['p', "The theblja half is the stronger half, and it is stronger for a reason worth stating plainly: those accounts froze having done nothing whatsoever. No comments, no profile changes, no joins. They were not worn out by use, because there was no use. Whatever was wrong with them arrived with them."],
          ['p', "That asymmetry is the actual finding. A good result at rest tells you very little. A bad result at rest tells you a great deal, because nothing else can be blamed for it."],
          ['note', "Since these verdicts were taken, the AbonTg accounts have started posting. That activity is not in the numbers above \u2014 every verdict in the table predates the first comment \u2014 and it means the two Argentine batches are no longer under identical conditions going forward. We will say so again at day 30 rather than quietly compare them as though nothing changed."],
        ],
      },
      {
        id: 'sample',
        title: 'How small this sample is',
        blocks: [
          ['p', "One import day. Two sellers. Batches of 50, 30 and 20 accounts. Two of the three batches come from a single purchase each, so a batch-level problem and a seller-level problem are indistinguishable here \u2014 one bad batch from a normally decent seller would look exactly like this."],
          ['p', "Nothing in this article supports a statement of the form \u201caged accounts survive X% less\u201d. It supports one narrower statement: in this test, on these batches, the rest-time claim did not predict the outcome, and the direction it got wrong was the expensive one."],
          ['p', "We are publishing it at this size because the alternative is publishing nothing until we have a sample nobody in this market ever gathers, while the claim we are testing keeps being sold at a premium in the meantime."],
        ],
      },
      {
        id: 'what-happens-next',
        title: 'What happens next, and when',
        blocks: [
          ['p', "The same three batches get measured again at day 30: 3 October for the Uzbek batch and 4 October for both Argentine ones. This article is updated on those dates with the new counts, whatever they say. If the AbonTg batch collapses in week three, that will appear here."],
          ['p', "There is no interim feed to subscribe to. The numbers on this page are the numbers, and they change on the two dates above."],
          ['p', "If you have a batch in hand right now, the useful move is not to take our numbers for it. Run the same check against your own accounts before you spend anything else on them \u2014 the account checker below is free, needs no signup, and answers the same question this article was built on: can this account still do the thing it was bought for?"],
          ['toolcta', {
            tool: 'account-checker',
            angle: 'You have just read that the seller\u2019s claim did not predict survival. The next question is what your own batch actually does.',
          }],
        ],
      },
    ],
  },
];

/* ── draft: true — written, keeps its address, is not published ────

   A post stays in POSTS so its slug is still reserved, still validated
   by prerender.mjs's slug/category/date checks, and still visible to
   whoever opens this file. It is simply not published: it is absent
   from the index, from its category, from the read-next rail, from the
   router and from the sitemap, and prerender.mjs's existing sweep over
   blog/ deletes the .html the last build left behind, so the address
   answers 404 rather than serving a page nothing links to.

   WHY THE FLAG RATHER THAN DELETING THE ENTRY. The slug is the asset.
   /blog/how-to-check-telegram-account-before-buying was published as
   scaffolding and read, to anyone arriving from search, as "the real
   text is being written" and "nothing in it should be read as advice" —
   on the one article the blog had, in the week the SEO work landed.
   Deleting the entry would free the slug for a typo'd re-creation and
   lose the two dates; this keeps both and costs one word to undo.

   TO PUBLISH: delete the `draft: true` line and rebuild. Nothing else
   moves — the slug, the category and the published date are already
   what they will be.
─────────────────────────────────────────────────────────────────── */
const PUBLISHED_POSTS = POSTS.filter(p => !p.draft);

/* Keyed on the published set, so the router cannot reach a draft either:
   postFromPath is what turns /blog/<slug> into a page, and a draft that
   404s for a crawler but renders for anyone with JavaScript would be
   published in every sense that matters. */
const POST_BY_SLUG = Object.fromEntries(PUBLISHED_POSTS.map(p => [p.slug, p]));

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

/* ── What a list page says when it has nothing to list ─────────────

   "Nothing here yet." was the whole empty state, and it was written for
   a case nobody expected to be in for long. Pulling the placeholder
   article back to draft put us in it, and one sentence on an otherwise
   bare page is a dead end for the visitor and a thin page for a
   crawler — /blog measured 240 characters of body text, under the floor
   verify-routes.mjs sets, and the build said so.

   So the empty state does the two things it can honestly do: say what
   the blog is for without promising a date, and hand the reader the
   pages that already answer the same questions properly. Both are true
   today and neither needs revisiting when the first article lands.

   Here, beside the posts, because prerender.mjs and blog.jsx both
   render it — a list page that says one thing before hydration and a
   different thing after is a page that says neither.
─────────────────────────────────────────────────────────────────── */
const BLOG_EMPTY = {
  lead:
    'No articles published yet. The first ones are being written from our own numbers rather '
    + 'than a summary of somebody else’s: what a batch of accounts actually costs once you '
    + 'divide the price by the share that survives, and what a checker can and cannot prove '
    + 'about an account before you buy it.',
  links: [
    { href: '/guides/buying-telegram-accounts', label: 'Guide: buying Telegram accounts' },
    { href: '/guides/proxies-for-telegram-accounts', label: 'Guide: choosing and connecting proxies' },
  ],
};

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
  const all = PUBLISHED_POSTS
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
  BLOG_CATEGORIES, BLOG_CATEGORY_BY_SLUG, BLOG_RESERVED_SLUGS, BLOG_EMPTY,
  POSTS, POST_BY_SLUG,
  postHref, blogCategoryHref, postFromPath, blogCategoryFromPath,
  postsForList, relatedPosts, formatPostDate, postWasUpdated,
});
