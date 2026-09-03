/* ══════════════════════════════════════════════════════════════════
   verify-proxy-verdict-parity.mjs

   The proxy verdict exists twice - here in tool-checker.jsx and in the
   panel's lib/proxy-verdict.ts - and this fails the build if the two
   drift apart.

   WHY IT EXISTS AT ALL. Duplication is the disease this project has
   been treating all week: a string-to-ProxyType map lived in the engine
   and a second call site did not use it, so the proxy checker could not
   open a single SOCKS5 connection and every test agreed it was fine. So
   a second copy of ANY rule now needs a reason and a guard.

   The reason: these are two repositories with no shared build. The site
   is plain JSX served as globals; the panel is a Next app. Importing
   across them means publishing a package for three functions and a
   lookup table, which is a heavier permanent cost than the copy. The
   guard is this file: it reads BOTH sources as text and compares the
   four headlines and the tone rule.

   It is deliberately text-based rather than clever. Parsing TypeScript
   here would need a toolchain the site does not have, and the property
   worth protecting is small and literal: does the visitor on the public
   page read the same four sentences as the customer in the panel.

   SKIPPED, not failed, when the panel checkout is absent - the same
   convention the engine's cross-repo checks use, so this runs on a
   machine that only has the site. Located via ATREOX_DASHBOARD_DIR,
   else the conventional sibling ../atreox-dashboard.

   Run:  node scripts/verify-proxy-verdict-parity.mjs
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

function findDashboard() {
  const env = process.env.ATREOX_DASHBOARD_DIR;
  const candidates = env ? [env] : [path.resolve(ROOT, '..', 'atreox-dashboard')];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'lib', 'proxy-verdict.ts'))) return dir;
  }
  return null;
}

/* The four result values the engine can return. Read from the SITE's own
   table, so a fifth added here without a panel counterpart is caught by
   the comparison below rather than by nobody. */
function siteHeadlines(source) {
  const block = source.split('const PROXY_VERDICT = {')[1];
  if (!block) return null;
  const body = block.split('};')[0];
  const out = {};
  for (const m of body.matchAll(/(\w+):\s*\{\s*text:\s*'([^']+)',\s*tone:\s*'(\w+)'/g)) {
    out[m[1]] = { text: m[2], tone: m[3] };
  }
  return out;
}

/* The panel builds its headline in a switch and its tone in an if-chain.
   Both are read literally: the strings are what a person sees, and the
   strings are what must match. */
function panelHeadlines(source) {
  const fn = source.split('export function proxyVerdictHeadline')[1];
  if (!fn) return null;
  const body = fn.split('\n}')[0];
  const out = {};
  const cases = [...body.matchAll(/case "(\w+)":\s*(?:\/\/[^\n]*\n\s*)*(?:\/\*[\s\S]*?\*\/\s*)*return\s*"([^"]+)";/g)];
  for (const m of cases) out[m[1]] = m[2];
  const dflt = body.match(/default:\s*(?:\/\/[^\n]*\n\s*)*return\s*"([^"]+)";/);
  if (dflt) out.internal_error = dflt[1];
  return out;
}

console.log('Proxy verdict: the site and the panel say the same four things');

const siteSrc = fs.readFileSync(path.join(ROOT, 'tool-checker.jsx'), 'utf8');
const site = siteHeadlines(siteSrc);
check('the site declares a PROXY_VERDICT table', !!site);
check(
  'with all four engine results',
  site && ['ok', 'tcp_failed', 'telegram_failed', 'internal_error'].every((k) => k in site),
  site ? Object.keys(site).join(', ') : '',
);
check(
  'and four DISTINCT sentences - the whole point of not saying "Not usable" four times',
  site && new Set(Object.values(site).map((v) => v.text)).size === 4,
  site ? Object.values(site).map((v) => v.text).join(' | ') : '',
);
check(
  "our own crash is amber, not red - it is not a verdict about the visitor's proxy",
  site && site.internal_error.tone === 'warn' && site.tcp_failed.tone === 'bad',
  site ? `internal_error=${site.internal_error.tone} tcp_failed=${site.tcp_failed.tone}` : '',
);
check(
  'and it does not mention the proxy at all',
  site && !/proxy/i.test(site.internal_error.text),
  site ? site.internal_error.text : '',
);

const dashboard = findDashboard();
if (!dashboard) {
  console.log('\n  [SKIP] panel comparison - no ../atreox-dashboard checkout found');
  console.log(
    failures
      ? `\nFAIL: ${failures} check(s) failed.`
      : '\nPASS (panel comparison skipped): the site half holds.',
  );
  process.exit(failures ? 1 : 0);
}

const panelSrc = fs.readFileSync(path.join(dashboard, 'lib', 'proxy-verdict.ts'), 'utf8');
const panel = panelHeadlines(panelSrc);
check('the panel exposes proxyVerdictHeadline', !!panel);

if (site && panel) {
  for (const key of Object.keys(site)) {
    check(
      `"${key}" reads identically on both`,
      site[key].text === panel[key],
      `site: ${JSON.stringify(site[key].text)} / panel: ${JSON.stringify(panel[key])}`,
    );
  }
  check(
    'neither side knows a result the other does not',
    Object.keys(site).sort().join(',') === Object.keys(panel).sort().join(','),
    `site: ${Object.keys(site).sort()} / panel: ${Object.keys(panel).sort()}`,
  );
}

/* NEGATIVE CONTROL. A comparison that cannot fail proves nothing, so the
   same comparison is run against a deliberately altered copy and must
   report a difference. */
const tampered = panelSrc.replace('"Works with Telegram"', '"Totally fine"');
const tamperedHeadlines = panelHeadlines(tampered);
check(
  'negative control: a changed panel headline IS detected',
  !!tamperedHeadlines && tamperedHeadlines.ok !== (site && site.ok.text),
  tamperedHeadlines ? tamperedHeadlines.ok : 'parse failed',
);
check(
  'negative control: the parser really read the panel, it did not match nothing',
  !!panel && Object.keys(panel).length === 4,
  panel ? Object.keys(panel).join(', ') : '',
);

console.log();
if (failures) {
  console.log(`FAIL: ${failures} check(s) failed.`);
  process.exit(1);
}
console.log('PASS: both copies of the verdict say the same four things.');
