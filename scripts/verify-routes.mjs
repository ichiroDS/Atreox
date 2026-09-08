/* ══════════════════════════════════════════════════════════════════
   verify-routes.mjs

   Every page this site builds must have a route that reaches it.

   WHY THIS EXISTS. On 2026-09-04 the /tools hub shipped to production
   and returned 404 for its whole life there. Nothing was broken: the
   page was generated, committed, deployed and reachable at
   /tools.html — but vercel.json had no rewrite mapping /tools onto it,
   and this site has no cleanUrls, so every pretty URL is a rewrite
   somebody has to remember to write.

   That is the worst shape a bug can have. It is invisible from the
   inside: the build passes, the file exists, the sitemap advertises the
   URL to Google, and the only way anyone finds out is a visitor landing
   on a 404 — or not landing at all, because a 404'd URL in a sitemap is
   a page that quietly never ranks.

   So the two halves are compared mechanically: the pages prerender.mjs
   declares, against the rewrites vercel.json declares. Adding a page and
   forgetting its route now fails the build, at the only moment anybody
   is still looking.

   Run:  node scripts/verify-routes.mjs
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

/* Read the routes vercel.json will actually serve. Sources with a ":param"
   are pattern rewrites (/guides/:slug) and match a family rather than one
   path; they are collected separately so a page under such a family is not
   reported as missing. */
const vercelJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
const exact = new Set();
const patterns = [];
for (const rule of vercelJson.rewrites || []) {
  if (rule.source.includes(':')) {
    patterns.push(new RegExp(`^${rule.source.replace(/:[A-Za-z0-9_]+/g, '[^/]+')}$`));
  } else {
    exact.add(rule.source);
  }
}

function isRouted(url) {
  if (url === '/') return true; // index.html is served at the root by Vercel
  if (exact.has(url)) return true;
  return patterns.some((re) => re.test(url));
}

/* The URLs the site claims to have. Taken from the sitemap, which is
   generated from prerender.mjs's own tables - so this compares what we
   TELL GOOGLE against what we actually serve, which is the pairing that
   matters. Parsing the sitemap rather than importing prerender.mjs keeps
   this from depending on that file's internals. */
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map((m) => m[1] || '/');

console.log('Routes: every URL the sitemap advertises is one Vercel will serve');
check('the sitemap has URLs to check', urls.length > 0, `${urls.length} URL(s)`);

const unrouted = urls.filter((u) => !isRouted(u));
check(
  'every advertised URL has a route',
  unrouted.length === 0,
  unrouted.length
    ? `NO ROUTE for ${JSON.stringify(unrouted)} - add a rewrite to vercel.json`
    : `all ${urls.length} routed`,
);

/* And the file each route points at has to exist, or the rewrite sends
   visitors to a 404 by a longer path. */
const missingTargets = [];
for (const rule of vercelJson.rewrites || []) {
  if (rule.source.includes(':')) continue; // a family; spot-checked by the sitemap pass above
  const target = rule.destination.replace(/^\//, '');
  if (!fs.existsSync(path.join(ROOT, target))) missingTargets.push(rule.destination);
}
check(
  'every rewrite points at a file that exists',
  missingTargets.length === 0,
  missingTargets.length ? `missing ${JSON.stringify(missingTargets)}` : 'all targets present',
);

/* NEGATIVE CONTROLS. A comparison that cannot fail proves nothing, and this
   one is easy to get wrong in the direction of always passing - a regex that
   matches everything, or a sitemap parse that yields nothing. */
check(
  'negative control: an unrouted URL IS detected',
  !isRouted('/definitely-not-a-route-here'),
);
check(
  'negative control: the pattern rules do not match everything',
  !isRouted('/tools/nonexistent-checker'),
  'if this fails, a ":slug" rewrite is being read too broadly and the check is blind',
);
check(
  'negative control: /tools specifically resolves - the bug this file exists for',
  isRouted('/tools'),
);

/* ── The body ────────────────────────────────────────────────────
   A route that resolves is not the same as a page that exists.

   WHY THIS EXISTS. On 2026-09-08 Google reported eleven pages it would
   not index. All eleven were built, committed, routed, in the sitemap
   and answering 200 - and all eleven served the SAME body, byte for
   byte: 78 KB of shell whose only text was the source comments, no H1,
   and not one <a href>. The home page, both free checkers, the pricing
   page. Every check in this repo passed the whole time, because every
   check was asking whether the page RESOLVED.

   So the question this asks is the other one: does the page say
   anything. The prerendered block is where a crawler's answer lives -
   app.jsx deletes it the moment React mounts, so it is by definition
   the version without JavaScript - and it must carry exactly one H1
   and more prose than a stub.

   Comments are stripped before counting, and that is the point rather
   than tidiness: the eleven empty pages measured 401 characters of
   "text" and every one of those characters was a developer comment
   about how the build works. A floor that counts comments is a floor
   that the exact failure this file exists for walks straight through.
─────────────────────────────────────────────────────────────────── */

/* Set from the thinnest page that is legitimately thin, with room to
   spare: /blog is a heading, a lede and one post card - 353 characters
   - and a list page with one item on it is short because there is one
   item, not because it is broken. A floor above that would fail the
   build for telling the truth.

   It is still far above what the failure this file exists for scores.
   The eleven empty pages had no prerendered block at all: nothing to
   measure, zero characters, caught by the check above this one rather
   than by the floor. What the floor catches is the next version of that
   bug - a block that exists and is a husk. */
const MIN_TEXT = 250;

/* url -> the file Vercel serves for it, through the same rewrite table
   read above rather than a second guess at the mapping. */
function fileFor(url) {
  if (url === '/') return 'index.html';
  for (const rule of vercelJson.rewrites || []) {
    if (rule.source.includes(':')) {
      const re = new RegExp(`^${rule.source.replace(/:[A-Za-z0-9_]+/g, '([^/]+)')}$`);
      const m = re.exec(url);
      if (m) {
        let dest = rule.destination;
        let i = 1;
        dest = dest.replace(/:[A-Za-z0-9_]+/g, () => m[i++]);
        return dest.replace(/^\//, '');
      }
    } else if (rule.source === url) {
      return rule.destination.replace(/^\//, '');
    }
  }
  return null;
}

/* The prerendered block, as prose. Scripts, styles and comments go
   first - a <script> is not something a reader reads, and a comment is
   not something anybody reads. */
function prerenderedText(html) {
  const m = /<div id="prerendered"[\s\S]*?(?=<div id="root"><\/div>)/.exec(html);
  if (!m) return null;
  return m[0]
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function h1Count(html) {
  const m = /<div id="prerendered"[\s\S]*?(?=<div id="root"><\/div>)/.exec(html);
  return m ? (m[0].match(/<h1[\s>]/gi) || []).length : 0;
}

/* One page's verdict, as a list of complaints. Separated from the loop
   so the negative controls below can run it over a page they have
   deliberately broken, rather than trusting that it would have caught
   them. */
function auditBody(url, html) {
  const bad = [];
  const text = prerenderedText(html);
  if (text === null) {
    bad.push(`${url}: no prerendered block at all - a crawler gets an empty document`);
    return bad;
  }
  const n = h1Count(html);
  if (n !== 1) bad.push(`${url}: ${n} <h1> in the prerendered block, want exactly 1`);
  if (text.length < MIN_TEXT) {
    bad.push(`${url}: ${text.length} characters of text, want at least ${MIN_TEXT}`);
  }
  return bad;
}

console.log('\nBody: every advertised URL says something without JavaScript');

const bodyPages = [];
for (const url of urls) {
  const file = fileFor(url);
  if (!file) { check(`${url}: resolves to a file`, false, 'no rewrite maps it'); continue; }
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) { check(`${url}: ${file} exists`, false); continue; }
  bodyPages.push([url, fs.readFileSync(full, 'utf8')]);
}

const thin = bodyPages.flatMap(([url, html]) => auditBody(url, html));
check(
  `all ${bodyPages.length} advertised pages carry a body`,
  thin.length === 0,
  thin.length ? thin.slice(0, 6).join('; ') : 'every one has an H1 and real text',
);

/* The shortest and longest, printed rather than asserted: a number
   drifting toward the floor is worth seeing before it crosses it. */
{
  const sized = bodyPages
    .map(([url, html]) => [url, (prerenderedText(html) || '').length])
    .sort((a, b) => a[1] - b[1]);
  console.log(`         thinnest: ${sized[0][0]} (${sized[0][1]}), fattest: ${sized[sized.length - 1][0]} (${sized[sized.length - 1][1]})`);
}

/* NEGATIVE CONTROLS. A floor that nothing can fall through proves
   nothing. Each of these is a real page, gutted the way the eleven were
   gutted, run through the same auditBody the loop above uses. */
{
  const [url, html] = bodyPages.find(([u]) => u === '/') || bodyPages[0];

  check(
    'negative control: a page with NO prerendered block IS reported',
    auditBody(url, html.replace(/<div id="prerendered"[\s\S]*?(?=<div id="root"><\/div>)/, '')).length > 0,
    'this is the exact shape the home page shipped in until 2026-09-08',
  );
  check(
    'negative control: a page with no <h1> IS reported',
    auditBody(url, html.replace(/<h1[\s>]/i, '<h2 ')).length > 0,
  );
  check(
    'negative control: a page emptied down to its comments IS reported',
    auditBody(url, html.replace(
      /<div id="prerendered"[\s\S]*?(?=<div id="root"><\/div>)/,
      '<div id="prerendered"><!-- '
      + 'a comment long enough to clear the floor on its own, which is why '
      + 'comments are stripped before the text is measured: the eleven empty '
      + 'pages scored 401 characters and every one of them was a comment '
      + 'exactly like this one, sitting in the shell where the page should be. '
      + 'Repeated so the raw block is comfortably over six hundred characters '
      + 'and the only thing standing between it and a PASS is the stripping. '
      + 'Repeated so the raw block is comfortably over six hundred characters '
      + 'and the only thing standing between it and a PASS is the stripping. '
      + '--></div>',
    )).length > 0,
    'comments must not count as content, or the original bug passes',
  );
  check(
    'negative control: the real page does NOT trip any of the above',
    auditBody(url, html).length === 0,
    'if this fails, the checks are firing on everything and mean nothing',
  );
}

/* ── The navigation ──────────────────────────────────────────────
   Every item in the header and the footer must lead somewhere that
   exists. A nav entry naming a page id nothing renders, or one whose
   path has no rewrite, is a dead link in the most expensive place on
   the site - and it looks completely fine in the diff that adds it.

   This is the second half of the /tools story: that page was built,
   deployed and in the sitemap while the header still pointed at Blog,
   so the hub nobody could reach was also the hub nobody could see. */
const shared = fs.readFileSync(path.join(ROOT, 'shared.jsx'), 'utf8');
const appJsx = fs.readFileSync(path.join(ROOT, 'app.jsx'), 'utf8');

/* PAGE_TO_PATH is the site's own answer to "where does this page id
   live". Read from it rather than re-deriving, so this cannot disagree
   with the router. */
const pageToPath = {};
const mapBody = appJsx.split('const PAGE_TO_PATH = {')[1]?.split('};')[0] ?? '';
for (const m of mapBody.matchAll(/'([^']+)':\s*'([^']+)'/g)) pageToPath[m[1]] = m[2];

/* The rendered page ids: `case 'tools': return <ToolsHubPage .../>`.
   'home' is the switch's `default:` branch and so has no case of its own.
   That is added explicitly rather than by loosening the rule, because the
   default branch is exactly what makes a typo dangerous here: any id with no
   case silently renders the HOME page instead of failing, so a nav item
   pointing at 'guide' rather than 'guides' would look like a working link
   that quietly takes you to the front page. Every id except 'home' must have
   its own case. */
const hasDefault = /default:\s*return/.test(appJsx);
const rendered = new Set(
  [...appJsx.matchAll(/case\s+'([a-z0-9-]+)':\s*return/g)].map((m) => m[1]),
);
if (hasDefault) rendered.add('home');

function navIds(source, marker) {
  const after = source.indexOf(marker);
  if (after === -1) return [];
  const body = source.slice(after, after + 1800);
  const list = body.split('];')[0];
  return [...list.matchAll(/\{\s*id:\s*'([a-z0-9-]+)'/g)].map((m) => m[1]);
}

const headerIds = navIds(shared, 'const links = [');
const footerIds = navIds(shared, 'const navLinks = [');

console.log('\nNavigation: every header and footer item leads somewhere real');
check('the header nav was found', headerIds.length >= 4, headerIds.join(', '));
check('the footer nav was found', footerIds.length >= 4, footerIds.join(', '));
check('PAGE_TO_PATH was parsed', Object.keys(pageToPath).length >= 8,
  `${Object.keys(pageToPath).length} entries`);

for (const [where, ids] of [['header', headerIds], ['footer', footerIds]]) {
  for (const id of ids) {
    const target = pageToPath[id];
    check(
      `${where}: "${id}" has a path`,
      Boolean(target),
      target ? target : 'not in PAGE_TO_PATH - clicking it goes nowhere',
    );
    check(
      `${where}: "${id}" renders a page`,
      rendered.has(id),
      rendered.has(id) ? '' : 'no case in the page switch - blank screen',
    );
    if (target) {
      check(
        `${where}: "${id}" -> ${target} is served`,
        isRouted(target),
        isRouted(target) ? '' : 'no Vercel rewrite - 404',
      );
    }
  }
}

/* The blog is not in the header any more. It must still be reachable,
   or "we moved it to the footer" is how a section quietly dies. */
check(
  'the blog is still reachable from the footer',
  footerIds.includes('blog'),
  footerIds.join(', '),
);
check(
  'and /blog still resolves',
  isRouted('/blog') && fs.existsSync(path.join(ROOT, 'blog.html')),
);
check(
  'the tools hub is in the header',
  headerIds.includes('tools'),
  headerIds.join(', '),
);

/* NEGATIVE CONTROLS: a nav check that cannot fail is decoration. */
check(
  'negative control: an id with no path WOULD be caught',
  pageToPath['definitely-not-a-page'] === undefined,
);
check(
  'negative control: the page switch was really parsed, not matched empty',
  rendered.size >= 8 && rendered.has('tools'),
  `${rendered.size} rendered page(s)`,
);
check(
  "the switch still has a default branch - it is what renders 'home'",
  hasDefault,
);
check(
  'negative control: a mistyped nav id WOULD be caught rather than silently '
  + 'rendering the home page',
  !rendered.has('guide') && rendered.has('guides'),
);

console.log();
if (failures) {
  console.log(`FAIL: ${failures} check(s) failed.`);
  process.exit(1);
}
console.log(`PASS: all ${urls.length} advertised URLs have a route to a real file.`);
