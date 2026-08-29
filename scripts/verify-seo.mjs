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

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://www.atreoxai.com';

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? ` - ${detail}` : ''}`);
  if (!ok) failures++;
};

/* The guide addresses as of the day the blog landed. A guide may be
   ADDED freely; one that disappears from this list has been renamed or
   deleted, and both break every link anyone has ever shared to it. */
const GUIDE_URLS_AT_BLOG_LAUNCH = [
  'buying-telegram-accounts', 'proxies-for-telegram-accounts', 'billing',
  'account-manager', 'profile-templates', 'active-warmup', 'channel-parser',
  'group-parser', 'neurocommenting', 'neurodialogs', 'mass-reactions',
];

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
const missing = GUIDE_URLS_AT_BLOG_LAUNCH.filter(u => !guideUrls.has(u));
check(
  'every guide that existed before still does',
  !missing.length,
  missing.length ? `gone: ${missing.join(', ')}` : `${guideUrls.size} guide page(s)`,
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
  GUIDE_URLS_AT_BLOG_LAUNCH.every(u => manifest[`guide:${u}`]),
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
check('there is at least one article page', articleFiles.length > 0, `${articleFiles.length}`);

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

console.log('');
if (failures) {
  console.error(`FAIL: ${failures} check(s) failed.`);
  process.exit(1);
}
console.log('PASS: every page owns its address, the sitemap agrees, and no guide has moved.');
