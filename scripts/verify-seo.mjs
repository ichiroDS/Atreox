/* ══════════════════════════════════════════════════════════════════
   verify-seo.mjs — every page says which address it is, once, and the
   sitemap agrees.

   WHY THIS EXISTS. This site has already shipped the failure it checks
   for. Nine router routes were served from one shell, so all nine
   carried index.html's head — the same title, the same description,
   and the same canonical pointing at "/". The sitemap asked Google to
   index nine pages while eight of them said "I am really the home
   page", and canonical wins that argument. Nothing failed; the pages
   simply stopped being indexed.

   That was fixed by giving every route its own head. This asserts it,
   for every generated file, on every build — because "each page has
   its own head" is a property somebody has to keep true, and the blog
   has just tripled the number of generated pages.

   WHAT IS CHECKED
     1. exactly one <link rel="canonical"> per generated page
     2. it points at that page's own address, not another page's
     3. no two pages claim the same canonical
     4. the set of canonicals and the set of sitemap <loc>s match
     5. every guide address that existed before still exists — a
        renamed guide slug is a dead link everywhere it was shared,
        and index.html's legacy #guide- redirect map depends on them
     6. every sitemap lastmod is a real date, and none of them is
        simply "today for everything" — the noise this build stopped
        producing on purpose (see resolveLastmod in prerender.mjs)
     7. article pages carry Article + BreadcrumbList JSON-LD that
        parses, with the dates the article actually declares

   NEGATIVE CONTROLS. Checks 1-4 are run against mutated copies of a
   real page and must fail there. Without that, a PASS only means the
   reader is quiet.

   Reads what is on disk; run it AFTER the build. Run with:
     node scripts/verify-seo.mjs
══════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ORIGIN, RETIRED_ORIGINS } from './site.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? ` - ${detail}` : ''}`);
  if (!ok) failures++;
};

/* The guide addresses as of the day the blog landed. A guide may be
   ADDED freely; one that disappears must leave a permanent redirect in
   vercel.json behind it, or every link anyone has ever shared to it
   breaks. (2026-09-27: billing, profile-templates, spamblock-frozen-
   shadowban and telegram-session-killed-by-ip-change were retired that
   way - merged into other guides or /pricing.) */
const GUIDE_URLS_AT_BLOG_LAUNCH = [
  'buying-telegram-accounts', 'proxies-for-telegram-accounts', 'billing',
  'account-manager', 'profile-templates', 'active-warmup', 'channel-parser',
  'group-parser', 'neurocommenting', 'neurodialogs', 'mass-reactions',
  'spamblock-frozen-shadowban', 'telegram-session-killed-by-ip-change',
];
const REDIRECTS = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8')).redirects || [];
const redirectedPermanently = url =>
  REDIRECTS.some(r => r.source === '/guides/' + url && r.permanent === true);

/* Every generated page, as [address, file]. Derived from the files on
   disk rather than from a list here, so a new prerendered route is
   covered the day it is added rather than the day somebody remembers
   this file. */
function generatedPages() {
  const pages = [['/', 'index.html']];
  for (const f of fs.readdirSync(ROOT)) {
    if (!f.endsWith('.html') || f === 'index.html') continue;
    pages.push(['/' + f.replace(/\.html$/, ''), f]);
  }
  /* Walked rather than listed. A hardcoded list of directories is a
     list somebody has to remember to extend - and it was already wrong
     the first time this ran, missing tools/ entirely, which is exactly
     the failure mode: the check quietly stops covering a page instead
     of failing. `ds-bundle` is design-review output, never deployed;
     `public` holds assets, not pages. */
  const SKIP = new Set(['node_modules', 'public', 'scripts', '.git', 'ds-bundle', 'api', '.vercel']);
  const walk = dir => {
    for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      const rel = dir ? `${dir}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (!SKIP.has(entry.name)) walk(rel);
      } else if (entry.name.endsWith('.html') && dir) {
        pages.push([`/${rel.replace(/\.html$/, '')}`, rel]);
      }
    }
  };
  walk('');
  return pages;
}

const canonicalsOf = html => [...html.matchAll(/<link rel="canonical" href="([^"]*)"/g)].map(m => m[1]);

/* One page's findings, as a function so the negative controls can hand
   it a deliberately broken copy. */
function auditPage(address, html) {
  const found = canonicalsOf(html);
  const findings = [];
  if (found.length === 0) findings.push(`${address}: no canonical at all`);
  if (found.length > 1) findings.push(`${address}: ${found.length} canonicals`);
  if (found.length === 1) {
    const want = address === '/' ? ORIGIN + '/' : ORIGIN + address;
    if (found[0] !== want) findings.push(`${address}: canonical says ${found[0]}`);
  }
  return findings;
}

console.log('SEO: canonicals, the sitemap, and the addresses that must not move');

const pages = generatedPages();
const sitemapXml = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const sitemapLocs = [...sitemapXml.matchAll(/<loc>([^<]*)<\/loc>/g)].map(m => m[1]);
const sitemapRows = [...sitemapXml.matchAll(/<loc>([^<]*)<\/loc>\s*<lastmod>([^<]*)<\/lastmod>/g)]
  .map(m => ({ loc: m[1], lastmod: m[2] }));

/* ── Negative controls, first ─────────────────────────────────────── */
console.log('\n0. the audit can see each fault it exists to see');

const sample = fs.readFileSync(path.join(ROOT, pages.find(([a]) => a !== '/')[1]), 'utf8');
const sampleAddress = pages.find(([a]) => a !== '/')[0];

check(
  'a page claiming to be the home page IS reported',
  auditPage(sampleAddress, sample.replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${ORIGIN}/"`)).length > 0,
  'this is the exact shape of the failure this site already shipped',
);
check(
  'a page with no canonical IS reported',
  auditPage(sampleAddress, sample.replace(/<link rel="canonical" href="[^"]*">/, '')).length > 0,
);
check(
  'a page whose canonical is on the retired host IS reported',
  auditPage(sampleAddress, sample.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${RETIRED_ORIGINS[0]}${sampleAddress}"`)).length > 0,
  'right path, old domain - the shape a half-finished domain move takes',
);
check(
  'a page with two canonicals IS reported',
  auditPage(sampleAddress, sample.replace(
    /(<link rel="canonical" href="[^"]*">)/,
    `$1\n  <link rel="canonical" href="${ORIGIN}/pricing">`)).length > 0,
);

/* ── The real files ───────────────────────────────────────────────── */
console.log('\n1. every generated page declares its own address, once');

const findings = [];
const seen = new Map();
for (const [address, file] of pages) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  findings.push(...auditPage(address, html));
  for (const c of canonicalsOf(html)) {
    if (seen.has(c)) findings.push(`${address} and ${seen.get(c)} share the canonical ${c}`);
    else seen.set(c, address);
  }
}
check(`all ${pages.length} generated pages`, !findings.length, findings.slice(0, 5).join('; '));

console.log('\n2. the sitemap and the canonicals are the same set');

const canonicalSet = new Set(seen.keys());
const sitemapSet = new Set(sitemapLocs);
const onlyInSitemap = [...sitemapSet].filter(u => !canonicalSet.has(u));
const onlyInPages = [...canonicalSet].filter(u => !sitemapSet.has(u));
check('nothing in the sitemap lacks a page', !onlyInSitemap.length, onlyInSitemap.join(', '));
check('no page is missing from the sitemap', !onlyInPages.length, onlyInPages.join(', '));

console.log('\n3. the guide addresses have not moved');

const guideUrls = new Set(
  fs.readdirSync(path.join(ROOT, 'guides'))
    .filter(f => f.endsWith('.html'))
    .map(f => f.replace(/\.html$/, '')),
);
const missing = GUIDE_URLS_AT_BLOG_LAUNCH.filter(u => !guideUrls.has(u) && !redirectedPermanently(u));
check(
  'every guide that existed before still does, or 301s to where it went',
  !missing.length,
  missing.length ? `gone with no redirect: ${missing.join(', ')}` : `${guideUrls.size} guide page(s)`,
);
const servedAndRedirected = [...guideUrls].filter(redirectedPermanently);
check(
  'no built guide page is shadowed by a redirect',
  !servedAndRedirected.length,
  servedAndRedirected.join(', '),
);
check(
  'negative control: a retired guide with no redirect IS reported',
  !redirectedPermanently('definitely-not-a-guide'),
);

/* index.html's legacy #guide-<slug> redirect reads this map; a guide
   missing from it is an old anchor that now lands on the home page. */
const slugMap = /\/\* SLUG-MAP \*\/([\s\S]*?)\/\* \/SLUG-MAP \*\//
  .exec(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'));
check('index.html still carries the legacy slug map', Boolean(slugMap));
if (slugMap) {
  const mapped = new Set(Object.values(JSON.parse(slugMap[1])));
  const unmapped = [...guideUrls].filter(u => !mapped.has(u));
  check('every guide address is reachable from the legacy map', !unmapped.length, unmapped.join(', '));
}

console.log('\n4. lastmod means something');

const badDates = sitemapRows.filter(r => !/^\d{4}-\d{2}-\d{2}$/.test(r.lastmod));
check('every lastmod is a date', !badDates.length, badDates.map(r => r.loc).join(', '));
check(
  'the sitemap covers every address',
  sitemapRows.length === sitemapLocs.length,
  `${sitemapRows.length} row(s) with a lastmod of ${sitemapLocs.length} url(s)`,
);
/* Not an assertion that the dates DIFFER - on the first build after the
   manifest was introduced they legitimately do not. What is asserted is
   that they come from the manifest rather than from the clock, which is
   what makes them capable of differing at all. */
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'content-lastmod.json'), 'utf8'));
check(
  'the lastmod manifest exists and covers the guides',
  GUIDE_URLS_AT_BLOG_LAUNCH.filter(u => guideUrls.has(u)).every(u => manifest[`guide:${u}`]),
  `${Object.keys(manifest).length} tracked entries`,
);
check(
  'every tracked entry carries a content hash, not just a date',
  Object.values(manifest).every(e => e && typeof e.hash === 'string' && e.hash.length >= 8),
  'without the hash the date could only ever be today',
);

console.log('\n5. article pages carry Article + BreadcrumbList');

const blogDir = path.join(ROOT, 'blog');
const articleFiles = fs.existsSync(blogDir)
  ? fs.readdirSync(blogDir).filter(f => f.endsWith('.html'))
  : [];
/* Not "at least one article exists" — that was the assertion here, and it
   turned an ordinary editorial decision into a failed deploy the first time
   the blog's only post was pulled back to draft. A blog with nothing
   published is a legitimate state; a blog that ADVERTISES an article it did
   not build, or builds one it does not advertise, is not.

   So the pairing is asserted in both directions instead, which also
   subsumes what the old check was really guarding: if the sitemap lists
   articles, the per-file assertions below cannot be vacuous, because there
   is a file for every one of them. When both sides are zero the run says so
   out loud rather than passing quietly. */
const articleLocs = sitemapLocs
  .map(u => u.replace(/^https?:\/\/[^/]+/, ''))
  .filter(u => /^\/blog\/[^/]+$/.test(u) && !u.startsWith('/blog/category/'));
const advertised = new Set(articleLocs.map(u => u.slice('/blog/'.length) + '.html'));
const built = new Set(articleFiles);

check(
  'every article in the sitemap has a built page',
  [...advertised].every(f => built.has(f)),
  [...advertised].filter(f => !built.has(f)).join(', '),
);
check(
  'every built article page is in the sitemap',
  [...built].every(f => advertised.has(f)),
  [...built].filter(f => !advertised.has(f)).join(', ') +
    ' - a page nobody advertises is one the sweep in prerender.mjs should have removed',
);
if (articleFiles.length === 0) {
  console.log('  [note] no article pages built - every post in blog-catalog.jsx is a draft');
}

for (const f of articleFiles) {
  const html = fs.readFileSync(path.join(blogDir, f), 'utf8');
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(m => { try { return JSON.parse(m[1]); } catch { return null; } });
  check(`${f}: every JSON-LD block parses`, blocks.every(Boolean));

  const types = blocks.filter(Boolean).flatMap(b => b['@graph'] ? b['@graph'].map(x => x['@type']) : [b['@type']]);
  check(`${f}: has Article`, types.includes('Article'));
  check(`${f}: has BreadcrumbList`, types.includes('BreadcrumbList'));
  /* Deliberately absent: FAQPage buys no rich result outside government
     and health sites, and marking up something for a snippet that will
     not appear is how a site accumulates schema nobody maintains. */
  check(`${f}: has no FAQPage`, !types.includes('FAQPage'), 'deliberate - see prerender.mjs');

  const article = blocks.filter(Boolean).find(b => b['@type'] === 'Article');
  if (article) {
    check(`${f}: datePublished is a date`, /^\d{4}-\d{2}-\d{2}$/.test(article.datePublished || ''));
    check(`${f}: dateModified is a date`, /^\d{4}-\d{2}-\d{2}$/.test(article.dateModified || ''));
    check(
      `${f}: dateModified is not before datePublished`,
      article.dateModified >= article.datePublished,
    );
    /* The page must not claim a revision the markup does not, or the
       other way round. "Updated" appears in the body only when the
       article really was revised. */
    const bodyClaimsUpdate = /<time datetime="[^"]*">Updated /.test(html);
    const markupClaimsUpdate = article.dateModified !== article.datePublished;
    check(
      `${f}: the visible dates and the markup agree`,
      bodyClaimsUpdate === markupClaimsUpdate,
      `body says updated: ${bodyClaimsUpdate}, markup says updated: ${markupClaimsUpdate}`,
    );
  }
}

/* 8. Telegram links: the bundle, every generated page, the shell. Added
   2026-09-14 to keep the channel link out; since 2026-09-29 the owner's
   invite link is back in SOCIAL_LINKS, so it is the one t.me address
   allowed and any other (a guessed handle) still fails. A code comment is
   not a link; only an href-able t.me URL counts. */
console.log("\n8. Telegram: the owner's channel invite and nothing else");
// 2026-09-29: the owner put the invite link back. Only that address may
// appear; any other t.me link (a guessed handle, a /c/ private link) fails.
const TG_ALLOWED = 'https://t.me/+YfEU_fmwGJlmOGZi';
const TG_LINK = /["'(=\s](https?:\/\/(?:t\.me|telegram\.me)\/[+\w][\w+\-/]*)/g;
const tgScan = ['public/app.js',
  ...pages.map(([, f]) => f)].filter(f => fs.existsSync(path.join(ROOT, f)));
const tgBad = [];
for (const f of tgScan) {
  for (const m of fs.readFileSync(path.join(ROOT, f), 'utf8').matchAll(TG_LINK)) {
    if (m[1] !== TG_ALLOWED) tgBad.push(`${f}: ${m[1]}`);
  }
}
check(`${tgScan.length} files, no t.me address but the channel invite`, tgBad.length === 0, tgBad.join(', '));
check('the channel invite is in the bundle (navbar, footer, home)',
  fs.existsSync(path.join(ROOT, 'public/app.js')) &&
    fs.readFileSync(path.join(ROOT, 'public/app.js'), 'utf8').includes(TG_ALLOWED));
check('NEGATIVE CONTROL: the pattern catches a guessed handle',
  [...`href: 'https://t.me/atreoxai'`.matchAll(TG_LINK)].some(m => m[1] !== TG_ALLOWED));

/* 9. The retired host. 2026-10 the site moved from www.atreoxai.com to
   www.atreox.ai (scripts/site.mjs). A canonical is already pinned to
   ORIGIN by check 1, but og:url, og:image, twitter:image, JSON-LD and
   robots.txt are not - and any of them left on the old host is a page
   that still introduces itself by its previous name. Only bare-site
   URLs count: app./api./brain.atreoxai.com and hello@atreoxai.com are
   other services that stay where they are, and the pattern does not
   match them (it requires the scheme and then www. or nothing). */
console.log('\n9. no generated file still names the retired host');
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const RETIRED_RE = new RegExp(`(?:${RETIRED_ORIGINS.map(escapeRe).join('|')})(?![\\w-])`, 'g');
const retiredScan = ['sitemap.xml', 'robots.txt', ...pages.map(([, f]) => f)]
  .filter(f => fs.existsSync(path.join(ROOT, f)));
const retiredBad = [];
for (const f of retiredScan) {
  const hits = fs.readFileSync(path.join(ROOT, f), 'utf8').match(RETIRED_RE);
  if (hits) retiredBad.push(`${f}: ${hits.length}x ${hits[0]}`);
}
check(`${retiredScan.length} files, every site URL on ${ORIGIN}`, !retiredBad.length, retiredBad.slice(0, 5).join('; '));
check('every sitemap <loc> is on ORIGIN',
  sitemapLocs.length > 0 && sitemapLocs.every(u => u === ORIGIN + '/' || u.startsWith(ORIGIN + '/')),
  sitemapLocs.filter(u => !u.startsWith(ORIGIN + '/')).slice(0, 3).join(', '));
check('NEGATIVE CONTROL: the pattern catches an og:url on the retired host',
  (`<meta property="og:url" content="${RETIRED_ORIGINS[0]}/pricing">`.match(RETIRED_RE) || []).length === 1);
check('NEGATIVE CONTROL: ...and leaves the dashboard and the mailbox alone',
  !RETIRED_RE.test('https://app.atreoxai.com/billing mailto:hello@atreoxai.com https://api.atreoxai.com'));
RETIRED_RE.lastIndex = 0;

console.log('');
if (failures) {
  console.error(`FAIL: ${failures} check(s) failed.`);
  process.exit(1);
}
console.log('PASS: every page owns its address, the sitemap agrees, and no guide has moved.');
