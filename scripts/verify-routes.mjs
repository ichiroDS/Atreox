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

console.log();
if (failures) {
  console.log(`FAIL: ${failures} check(s) failed.`);
  process.exit(1);
}
console.log(`PASS: all ${urls.length} advertised URLs have a route to a real file.`);
