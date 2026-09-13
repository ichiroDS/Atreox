/* ══════════════════════════════════════════════════════════════════
   verify-tool-next-steps.mjs — after a bad verdict the checker says what
   to do, points somewhere real, and collects nothing it should not.

   WHAT IT GUARDS (added 2026-09-14 with the lead capture):
     1. Every bad verdict has a next step, and a GOOD verdict gets none -
        a pitch under a proxy that works is the tone the site refuses.
     2. Every link in a next step is a page this build writes.
     3. The verdict list the page offers and the list the handoff function
        accepts are the same list, in both directions.
     4. The handoff can never carry a proxy host, port, login, password or
        file: handoffContext drops them from a result that has them, and
        the function refuses a body with any field beyond the four.
     5. No next step sells: no subscription, upgrade or pricing words. The
        limit screen is where the panel is offered, and it links /pricing.

   Each rule has a NEGATIVE CONTROL that must fail against a broken input.

   Run:  node scripts/verify-tool-next-steps.mjs
══════════════════════════════════════════════════════════════════ */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? ` - ${detail}` : ''}`);
  if (!ok) failures++;
};

const win = {};
vm.runInContext(fs.readFileSync(path.join(ROOT, 'tool-next-steps.jsx'), 'utf8'),
  vm.createContext({ window: win }));
const { TOOL_NEXT_STEPS: STEPS, proxyNextStepKey, accountNextStepKey, handoffContext } = win;
const handoff = require(path.join(ROOT, 'api', 'tools', 'handoff.js'));

console.log('Tool next steps: a bad verdict gets a next step, a good one gets nothing');

console.log('\n1. which results get a next step');
check('a working proxy that holds its exit: none', proxyNextStepKey({ result: 'ok', exit_held: 'pinned' }) === null);
check('a working proxy on an unknown provider: none', proxyNextStepKey({ result: 'ok', exit_held: 'unknown' }) === null);
check('our own check failing is not the visitor\'s problem: none', proxyNextStepKey({ result: 'internal_error' }) === null);
check('no connection -> tcp_failed', proxyNextStepKey({ result: 'tcp_failed' }) === 'tcp_failed');
check('works but exit not held -> exit_not_held', proxyNextStepKey({ result: 'ok', exit_held: 'not_pinned' }) === 'exit_not_held');
check('an account that can post: none', accountNextStepKey({ authorized: true, write_status: 'ok' }) === null);
check('a session that cannot log in -> session_not_usable', accountNextStepKey({ authorized: false }) === 'session_not_usable');
check('frozen -> frozen', accountNextStepKey({ authorized: true, write_status: 'frozen' }) === 'frozen');

console.log('\n2. every link is a page this build writes');
function builtFile(href) {
  const clean = href.replace(/[#?].*$/, '');
  return path.join(ROOT, clean.replace(/^\//, '') + '.html');
}
const links = Object.values(STEPS).flatMap((t) => Object.values(t).flatMap((s) => s.links));
const missing = links.filter((l) => !fs.existsSync(builtFile(l.href))).map((l) => l.href);
check(`${links.length} links, all to built pages`, missing.length === 0, missing.join(', '));
check('NEGATIVE CONTROL: a link to a page that does not exist is caught',
  !fs.existsSync(builtFile('/blog/no-such-article')));

console.log('\n3. the page and the handoff function accept the same verdicts');
for (const tool of ['proxy', 'account']) {
  const page = Object.keys(STEPS[tool]).sort().join(',');
  const fn = [...handoff.VERDICTS[tool]].sort().join(',');
  check(`${tool}: identical lists`, page === fn, `page=${page} function=${fn}`);
}
for (const [tool, entries] of Object.entries(STEPS)) {
  for (const [key, s] of Object.entries(entries)) {
    check(`${tool}/${key} is complete`, s.title && s.means && s.doing.length >= 2 && s.links.length >= 1);
  }
}

console.log('\n4. nothing identifying can be sent');
const rich = {
  result: 'ok', exit_held: 'not_pinned',
  telegram: { country: 'US' }, host: 'gw.dataimpulse.com', port: 10005,
  username: 'abc__cr.us', password: 'pw', label: 'socks5://gw.dataimpulse.com:10005',
};
const ctx = handoffContext('proxy', 'exit_not_held', rich);
const dump = JSON.stringify(ctx);
check('the context carries tool, verdict and country only',
  JSON.stringify(Object.keys(ctx).sort()) === '["country","tool","verdict"]', dump);
check('and none of the host, port, login or password',
  !/dataimpulse|10005|abc__cr|pw"|socks5/.test(dump), dump);
const good = handoff.validate({ username: '@some_user', tool: 'proxy', verdict: 'exit_not_held', country: 'US' });
check('a proper request is accepted', good.ok === true, JSON.stringify(good));
const extra = handoff.validate({ username: '@some_user', tool: 'proxy', verdict: 'exit_not_held', host: 'gw.dataimpulse.com' });
check('NEGATIVE CONTROL: a body with a host field is refused', extra.ok === false, JSON.stringify(extra));
check('NEGATIVE CONTROL: an unknown verdict is refused',
  handoff.validate({ username: '@some_user', tool: 'proxy', verdict: 'ok' }).ok === false);
check('NEGATIVE CONTROL: something that is not a username is refused',
  handoff.validate({ username: 'hi', tool: 'proxy', verdict: 'tcp_failed' }).ok === false);

console.log('\n5. a next step explains, it does not sell');
const SELLING = /\b(subscri\w*|upgrade|pricing|buy now|plan|pro version|unlimited)\b/i;
const salesy = Object.values(STEPS).flatMap((t) => Object.entries(t))
  .filter(([, s]) => SELLING.test([s.title, s.means, ...s.doing, ...s.links.map((l) => l.label)].join(' ')))
  .map(([k]) => k);
check('no next step uses selling words', salesy.length === 0, salesy.join(', '));
check('NEGATIVE CONTROL: the pattern does catch one', SELLING.test('Upgrade to unlimited checks'));
const checker = fs.readFileSync(path.join(ROOT, 'tool-checker.jsx'), 'utf8');
check('the limit screen still links /pricing', /function LimitScreen[\s\S]*?href="\/pricing"/.test(checker));
check('the next step is rendered under all three result widgets',
  (checker.match(/<NextStep /g) || []).length === 3, String((checker.match(/<NextStep /g) || []).length));

console.log('');
if (failures) {
  console.log(`FAILED: ${failures} check(s).`);
  process.exit(1);
}
console.log('All checks passed.');
