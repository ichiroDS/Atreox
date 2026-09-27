import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read = name => fs.readFileSync(new URL('../' + name, import.meta.url), 'utf8');
const box = {};
const win = new Proxy(box, { get: (t, k) => k in t ? t[k] : `Icon(${String(k)})` });
const ctx = vm.createContext({ window: win, console });
for (const file of ['research-guides.jsx', 'catalog.jsx']) {
  if (fs.existsSync(new URL('../' + file, import.meta.url))) new vm.Script(read(file)).runInContext(ctx);
}

/* The three folders, in order, holding exactly these guides (2026-09-27
   restructure: billing retired to /pricing; spamblock and profile templates
   merged into Account Manager; the session article merged into Account
   Protection; the aging article kept at its /blog address, in no folder). */
assert.ok(Array.isArray(box.GUIDE_FOLDERS), 'Guides must expose the three shared navigation folders');
assert.deepEqual(Array.from(box.GUIDE_FOLDERS, f => f.title), ['Start here', 'Protection', 'Modules']);
const EXPECTED = {
  start: ['buying-telegram-accounts', 'proxies-for-telegram-accounts'],
  protection: ['account-manager', 'account-protection', 'active-warmup'],
  modules: ['channel-parser', 'group-parser', 'neurocommenting', 'neurodialogs', 'mass-reactions'],
};
for (const folder of box.GUIDE_FOLDERS) {
  assert.deepEqual(Array.from(folder.urls), EXPECTED[folder.id], `folder ${folder.id} lists the agreed guides`);
  assert.deepEqual(Array.from(folder.guides, g => g.url), EXPECTED[folder.id],
    `every url in folder ${folder.id} resolves to a guide in GUIDES (a missing one is dropped from the page silently)`);
}

/* Every guide is in exactly one folder, except the research article. */
const urls = box.GUIDE_FOLDERS.flatMap(f => f.guides.map(g => g.url));
assert.equal(urls.length, new Set(urls).size, 'Folders do not repeat guides');
const research = box.GUIDES.filter(g => g.group === 'research');
assert.deepEqual(Array.from(research, g => g.url), [], 'no research articles remain (the aging article was retired)');
assert.deepEqual(
  Array.from(box.GUIDES.filter(g => g.group !== 'research'), g => g.url).sort(),
  [...urls].sort(),
  'every guide appears in one folder',
);

/* Retired guides are gone from the catalog, and their addresses 301 to their new homes. */
const redirects = JSON.parse(read('vercel.json')).redirects;
const RETIRED = {
  '/guides/billing': '/pricing',
  '/guides/spamblock-frozen-shadowban': '/guides/account-manager#spamblock-frozen-shadowban',
  '/guides/profile-templates': '/guides/account-manager#profile-templates',
  '/guides/telegram-session-killed-by-ip-change': '/guides/account-protection#session-killed-by-ip',
  '/blog/telegram-session-killed-by-ip-change': '/guides/account-protection#session-killed-by-ip',
};
for (const [source, destination] of Object.entries(RETIRED)) {
  assert.equal(box.guideFromPath(source), null, `${source} is no longer a guide`);
  for (const s of [source, source + '.html']) {
    assert.ok(redirects.some(r => r.source === s && r.destination === destination && r.permanent),
      `${s} 301s to ${destination}`);
  }
  /* A redirect into a guide must land on a guide that exists. */
  const target = destination.replace(/#.*$/, '');
  if (target.startsWith('/guides/')) assert.ok(box.guideFromPath(target), `${destination} is a live guide`);
}
/* No chains: a redirect never points at another redirect's source. */
const sources = new Set(redirects.map(r => r.source));
for (const r of redirects) {
  assert.ok(!sources.has(r.destination.replace(/#.*$/, '')), `${r.source} -> ${r.destination} is a redirect chain`);
}

/* The retired aging article 301s to the Buying guide's #aging section. */
for (const src of ['/blog/telegram-account-aging-claims-tested', '/blog/telegram-account-aging-claims-tested.html']) {
  assert.ok(redirects.some(r => r.source === src && r.destination === '/guides/buying-telegram-accounts#aging'), `${src} redirects to #aging`);
}

/* Profile Templates has no guide of its own; its module links into Account Manager. */
assert.equal(box.moduleGuideHref(box.MODULE_BY_KEY['profile-templates']), '/guides/account-manager#profile-templates');
for (const m of box.MODULES) {
  const href = box.moduleGuideHref(m);
  assert.ok(href && box.guideFromPath(href.replace(/#.*$/, '')), `module ${m.key} links to a live guide`);
  assert.ok(m.summary && Array.isArray(m.can) && m.can.length >= 3, `module ${m.key} has a summary and a short list for Functions`);
}

const controls = box.GUIDE_BY_URL['account-protection'].body.find(s => s.id === 'running-it').blocks.find(b => b[0] === 'controls')[1];
assert.deepEqual(Array.from(controls, c => c.name), ['Terminate other sessions', 'Reauthenticate', 'Download new tdata', 'Set 2FA']);
assert.match(JSON.stringify(controls), /separate backup session/);
const catalog = read('catalog.jsx');
assert.ok(!/Auto-Warmup|23-day warmup|72-hour lockout|Protect \(run pipeline\)/.test(catalog), 'Obsolete passive lifecycle and pipeline copy are removed');
assert.match(catalog, /x\/7/);
assert.match(catalog, /seven days after import/, 'Supervise is explained as counted from import');
console.log('PASS: guide folders, retired-guide redirects, legacy addresses, module guide links and supervision copy');
