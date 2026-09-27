/* ══════════════════════════════════════════════════════════════════
   verify-internal-links.mjs — every page a crawler can reach must have
   a way out of the page and into the two that earn money.

   WHY THIS EXISTS. The eleven router pages were given prerendered
   bodies and a site nav (commit 8dfa208). The guides, the blog and
   /referral-program were not, because they are built by different
   renderers - renderGuide, renderPost, renderPostList, renderReferral -
   and each one ends its own markup. Nobody noticed, because nothing
   looked broken: the pages were complete, they ranked, and a visitor
   with JavaScript got the full navbar the moment React mounted.

   What was actually missing only shows up from outside. Measured on
   2026-09-09 against e7b97c4: 15 of the 26 built pages contained not
   one link to /pricing, and the same 15 contained not one link to
   /tools. Those 15 are the guides and the blog - the pages built to be
   found in search. A crawler arriving on "how to buy telegram accounts"
   found eleven more guides and no route to a price. That is a site
   whose SEO half and whose selling half are two disconnected graphs.

   THE RULE IS NOT "every page must link everywhere". It is: every page
   that is in the sitemap must carry the site nav, which is one function
   (siteNav in prerender.mjs) and therefore one place to change what
   "the spine" means. The two named destinations below are asserted
   individually because they are the two the failure actually cost, and
   because a nav that silently lost an entry would still pass a check
   that only counted anchors.

   NEGATIVE CONTROL is not decorative here: run this file against the
   previous commit and it must fail with 15 pages listed. If it passes
   there, it is testing nothing.

   Run:  node scripts/verify-internal-links.mjs
══════════════════════════════════════════════════════════════════ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let failures = 0;
function check(name, ok, detail = '') {
  console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? ` - ${detail}` : ''}`);
  if (!ok) failures++;
}

/* The pages to check are taken from the sitemap, for the same reason
   verify-routes.mjs takes them from there: it is the list we hand to
   Google, so it is the list that has to hold up. */
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map((m) => m[1] || '/');

/* url -> the file Vercel serves for it, mirroring vercel.json's rewrites.
   Kept as a mapping rather than a guess so a URL with no file fails loudly
   instead of being skipped as "no file, no problem". */
function fileFor(url) {
  if (url === '/') return 'index.html';
  return url.replace(/^\//, '') + '.html';
}

console.log('Internal links: every page in the sitemap reaches the pages that sell');
check('the sitemap has URLs to check', urls.length > 0, `${urls.length} URL(s)`);

/* The destinations that were actually lost. Not a full crawl - a
   deliberately short list of the ones whose absence cost us traffic. */
const REQUIRED = ['/pricing', '/tools'];

const missing = { '/pricing': [], '/tools': [] };
const unreadable = [];

for (const url of urls) {
  const file = path.join(ROOT, fileFor(url));
  let html;
  try {
    html = fs.readFileSync(file, 'utf8');
  } catch {
    unreadable.push(`${url} -> ${fileFor(url)}`);
    continue;
  }
  for (const dest of REQUIRED) {
    // The page it IS does not need to link to itself.
    if (url === dest) continue;
    if (!html.includes(`href="${dest}"`)) missing[dest].push(url);
  }
}

check('every sitemap URL has a built file', unreadable.length === 0, unreadable.join(', '));

for (const dest of REQUIRED) {
  check(
    `every page links to ${dest}`,
    missing[dest].length === 0,
    missing[dest].length
      ? `${missing[dest].length} page(s) with none: ${missing[dest].join(', ')}`
      : `${urls.length - 1} page(s) checked`,
  );
}

/* ── The check on the check ───────────────────────────────────────
   Both assertions above are satisfied by a file containing the literal
   string; neither would notice if siteNav() stopped being a nav and
   started being a comment. These two say the anchors are real and that
   the nav is what is providing them. */
const guideSample = fs.readFileSync(path.join(ROOT, 'guides/buying-telegram-accounts.html'), 'utf8');

check(
  'negative control: the matcher can fail - a destination that is not linked anywhere is reported',
  !guideSample.includes('href="/nonexistent-page"'),
  'if this ever passes on a real page, includes() is matching something it should not',
);

check(
  'the links come from a <nav>, not from prose that happens to mention them',
  /<nav aria-label="Site"[\s\S]{0,4000}href="\/pricing"/.test(guideSample),
  'siteNav() emits nav[aria-label="Site"]; a guide with the anchors but no nav means two sources of the spine',
);

check(
  'a guide does not falsely mark a nav entry as the current page',
  !/<nav aria-label="Site"[\s\S]{0,4000}aria-current="page"/.test(guideSample),
  'a guide detail page is not any of the SITE_NAV destinations, so none of them is the current page',
);

/* ── Links INTO the guides ────────────────────────────────────────
   Added 2026-09-27, when four guides were retired into others. A link
   to /guides/<url> must land on a page this build writes, or on a
   permanent redirect in vercel.json - anything else is a 404 we linked
   to ourselves. Read from the built pages (what a crawler follows) AND
   from the page sources (links React renders that the prerendered
   block does not carry, e.g. a checker's next steps).

   Two softer findings are printed, not failed: a link that only works
   THROUGH a redirect (worth pointing straight at the new home), and a
   #section that the target page does not have (the page still opens,
   at the top). The second can legitimately be true on a branch that
   links to a section another branch is writing. */
const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
const redirectTo = new Map((vercel.redirects || []).map((r) => [r.source, r.destination]));
const SOURCE_FILES = fs.readdirSync(ROOT).filter((f) => f.endsWith('.jsx'));
const GUIDE_LINK = /(?:href="|['"`])(\/(?:guides|blog)\/[a-z0-9-]+)(#[A-Za-z0-9_-]+)?(?=["'`])/g;

const linkSites = new Map(); // "/guides/x#y" -> Set of where it was seen
const note = (href, where) => {
  if (!linkSites.has(href)) linkSites.set(href, new Set());
  linkSites.get(href).add(where);
};
for (const url of urls) {
  const file = path.join(ROOT, fileFor(url));
  if (!fs.existsSync(file)) continue;
  /* The legacy #guide- map in the shell is data, not a link on the page. */
  const html = fs.readFileSync(file, 'utf8').replace(/\/\* SLUG-MAP \*\/[\s\S]*?\/\* \/SLUG-MAP \*\//, '');
  for (const m of html.matchAll(GUIDE_LINK)) note(m[1] + (m[2] || ''), url);
}
for (const f of SOURCE_FILES) {
  for (const m of fs.readFileSync(path.join(ROOT, f), 'utf8').matchAll(GUIDE_LINK)) note(m[1] + (m[2] || ''), f);
}

const built = (p) => fs.existsSync(path.join(ROOT, p.replace(/^\//, '') + '.html'));
const idsIn = (p) => new Set([...fs.readFileSync(path.join(ROOT, p.replace(/^\//, '') + '.html'), 'utf8')
  .matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

const dead = [];
const viaRedirect = [];
const noAnchor = [];
for (const [href, where] of linkSites) {
  const [p, anchor] = href.split('#');
  const from = [...where].slice(0, 3).join(', ');
  let target = p;
  let hash = anchor;
  if (!built(p)) {
    const dest = redirectTo.get(p);
    if (!dest) { dead.push(`${href} (in ${from})`); continue; }
    viaRedirect.push(`${href} -> ${dest} (in ${from})`);
    /* A fragment on the redirect's Location replaces the link's own
       (RFC 7231 7.1.2); without one, the link's fragment carries over. */
    [target, hash] = dest.split('#');
    hash = hash || anchor;
    if (!target.startsWith('/') || !built(target)) continue;
  }
  if (hash && !idsIn(target).has(hash)) noAnchor.push(`${target}#${hash} (in ${from})`);
}

console.log('\nLinks into the guides: every one lands on a page or a redirect');
check(
  `${linkSites.size} distinct guide/blog link(s), none to a missing page`,
  dead.length === 0,
  dead.join('; '),
);
check(
  'negative control: a link to a page that does not exist WOULD be reported',
  !built('/guides/definitely-not-a-guide') && !redirectTo.has('/guides/definitely-not-a-guide'),
);
if (viaRedirect.length) {
  console.log(`  [note] ${viaRedirect.length} link(s) go through a redirect - point them at the new address:`);
  for (const l of viaRedirect) console.log(`         ${l}`);
}
if (noAnchor.length) {
  console.log(`  [note] ${noAnchor.length} link(s) name a #section the page does not have (it opens at the top):`);
  for (const l of noAnchor) console.log(`         ${l}`);
}

console.log(
  failures === 0
    ? '\nPASS: no page in the sitemap is a dead end.\n'
    : `\nFAIL: ${failures} check(s) failed.\n`,
);
process.exit(failures === 0 ? 0 : 1);
