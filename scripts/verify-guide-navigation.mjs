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
assert.ok(Array.isArray(box.GUIDE_FOLDERS), 'Guides must expose the three shared navigation folders');
assert.deepEqual(Array.from(box.GUIDE_FOLDERS, f => f.title), ['Start here', 'Protection', 'Modules']);
const urls = box.GUIDE_FOLDERS.flatMap(f => f.guides.map(g => g.url));
assert.equal(new Set(urls).size, box.GUIDES.length, 'Every guide appears in one folder');
assert.equal(urls.length, box.GUIDES.length, 'Folders do not repeat guides');
const protection = box.GUIDE_FOLDERS.find(f => f.id === 'protection');
assert.ok(protection.guides.some(g => g.url === 'telegram-session-killed-by-ip-change'));
for (const [slug, label] of [['neurocommenting', 'Neurocommenting'], ['neurodialogs', 'Neurodialogs'], ['mass-reactions', 'Mass Reactions']]) {
  assert.equal(box.GUIDE_BY_URL[slug].navTitle, label);
}
const session = box.GUIDE_BY_URL['telegram-session-killed-by-ip-change'];
assert.ok(session.body.some(s => s.id === 'the-error'), 'Existing article anchors survive migration');
assert.equal(box.guideHref(session), '/guides/telegram-session-killed-by-ip-change');
const aging = box.GUIDE_BY_URL['telegram-account-aging-claims-tested'];
assert.equal(box.guideHref(aging), '/blog/telegram-account-aging-claims-tested', 'The other article keeps its public address');
assert.equal(box.guideFromPath('/blog/telegram-account-aging-claims-tested')?.slug, aging.slug);
const redirects = JSON.parse(read('vercel.json')).redirects;
assert.ok(redirects.some(r => r.source === '/blog/telegram-session-killed-by-ip-change' && r.destination === box.guideHref(session) && r.permanent));
assert.ok(!redirects.some(r => r.source === box.guideHref(aging)), 'The preserved article must not redirect');
const controls = box.GUIDE_BY_URL['account-protection'].body.find(s => s.id === 'running-it').blocks.find(b => b[0] === 'controls')[1];
assert.deepEqual(Array.from(controls, c => c.name), ['Terminate other sessions', 'Reauthenticate', 'Download new tdata', 'Set 2FA']);
assert.match(JSON.stringify(controls), /separate backup session/);
const catalog = read('catalog.jsx');
assert.ok(!/Auto-Warmup|23-day warmup|72-hour lockout|Protect \(run pipeline\)/.test(catalog), 'Obsolete passive lifecycle and pipeline copy are removed');
assert.match(catalog, /x\/7/);
assert.match(catalog, /added_at/);
console.log('PASS: guide folders, legacy addresses, protection controls and supervision copy');
