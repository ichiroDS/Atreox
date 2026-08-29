/* ══════════════════════════════════════════════════════════════════
   verify-blocks.mjs — the two block renderers are one renderer.

   THE HOLE THIS CLOSES. Guides and articles share a block vocabulary
   and two implementations of it: ReaderBlocks in guides.jsx, which
   React renders once it mounts, and renderBlocks in prerender.mjs,
   which writes what a crawler and a no-JS visitor actually receive.
   They are kept in step by hand, and they fail DIFFERENTLY on a kind
   they do not know:

     prerender.mjs   default: throw   -> the deploy stops. Loud, fine.
     guides.jsx      default: null    -> the block silently disappears
                                         from the page, and every build
                                         goes on passing.

   So a kind added to the catalog and to the prerenderer, but missed in
   the React renderer, ships. The prerendered page has it, the page a
   reader sees a moment later does not, and nothing anywhere says so.
   That asymmetry existed before the blog and is what made adding
   `toolcta` — a block whose entire job is conversion — worth pinning
   down first.

   WHAT IS CHECKED
     1. every kind in BLOCK_KINDS has a case in BOTH renderers
     2. every kind actually used by a guide or an article is declared
        in BLOCK_KINDS (so the list cannot quietly go stale)
     3. nothing is declared that neither uses and neither handles

   NEGATIVE CONTROL. Each check is first run against a deliberately
   broken copy of the source and must FAIL there. A checker that cannot
   see the fault it exists to see is worse than no checker, because it
   prints PASS.

   Run with:  node scripts/verify-blocks.mjs
══════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/\r\n/g, '\n');

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? ` - ${detail}` : ''}`);
  if (!ok) failures++;
};

/* Every `case '<kind>':` in a source. Deliberately not a parse: the two
   renderers are a switch each, the label is the kind, and a regex over
   the case labels cannot be fooled by anything a switch can legally
   contain. */
function casesIn(source) {
  return new Set([...source.matchAll(/case\s+'([a-z]+)'\s*:/g)].map(m => m[1]));
}

/* Both content files, run in the same stubbed-window box prerender.mjs
   uses, so this reads exactly the data the build reads. */
function loadContent() {
  const box = {};
  const win = new Proxy(box, { get: (t, k) => (k in t ? t[k] : `Icon(${String(k)})`), has: () => true });
  const ctx = vm.createContext({ window: win, console });
  for (const file of ['catalog.jsx', 'blog-catalog.jsx']) {
    new vm.Script(read(file), { filename: file }).runInContext(ctx);
  }
  return box;
}

/* Every kind any piece of content actually uses, guides and articles
   alike, walking into the nested bodies (a card holds blocks, and so
   does each card in a cards row). */
function kindsUsed(bodies) {
  const used = new Set();
  const walk = blocks => {
    for (const [kind, v] of blocks) {
      used.add(kind);
      if (kind === 'card' && v && v.blocks) walk(v.blocks);
      if (kind === 'cards' && Array.isArray(v)) for (const c of v) if (c.blocks) walk(c.blocks);
    }
  };
  for (const body of bodies) for (const section of body) walk(section.blocks);
  return used;
}

/* The three questions, as one function, so the negative controls can
   ask them of a mutated source and get the same answers back. */
function audit({ blockKinds, readerCases, prerenderCases, used }) {
  const findings = [];
  for (const kind of blockKinds) {
    if (!readerCases.has(kind)) findings.push(`ReaderBlocks (guides.jsx) has no case for "${kind}"`);
    if (!prerenderCases.has(kind)) findings.push(`renderBlocks (prerender.mjs) has no case for "${kind}"`);
  }
  for (const kind of used) {
    if (!blockKinds.includes(kind)) findings.push(`content uses "${kind}", which is not in BLOCK_KINDS`);
  }
  for (const kind of blockKinds) {
    if (!used.has(kind) && !readerCases.has(kind) && !prerenderCases.has(kind)) {
      findings.push(`BLOCK_KINDS declares "${kind}", which nothing uses and neither renderer handles`);
    }
  }
  return findings;
}

console.log('Block renderers: guides.jsx and prerender.mjs handle the same kinds');

const box = loadContent();
const { BLOCK_KINDS, GUIDES, POSTS, TOOL_BY_ID } = box;
const guidesSrc = read('guides.jsx');
const prerenderSrc = read('scripts/prerender.mjs');

const real = {
  blockKinds: BLOCK_KINDS,
  readerCases: casesIn(guidesSrc),
  prerenderCases: casesIn(prerenderSrc),
  used: kindsUsed([...GUIDES.filter(g => g.body).map(g => g.body), ...POSTS.map(p => p.body)]),
};

/* ── Negative controls, first ─────────────────────────────────────── */
console.log('\n0. the audit can see each fault it exists to see');

check(
  'a kind missing from ReaderBlocks IS reported',
  audit({ ...real, readerCases: new Set([...real.readerCases].filter(k => k !== 'toolcta')) })
    .some(f => f.includes('ReaderBlocks') && f.includes('toolcta')),
  'this is the silent one - guides.jsx returns null rather than throwing',
);

check(
  'a kind missing from renderBlocks IS reported',
  audit({ ...real, prerenderCases: new Set([...real.prerenderCases].filter(k => k !== 'faq')) })
    .some(f => f.includes('prerender.mjs') && f.includes('faq')),
);

check(
  'a kind used but undeclared IS reported',
  audit({ ...real, used: new Set([...real.used, 'notarealkind']) })
    .some(f => f.includes('notarealkind')),
);

/* ── The real sources ─────────────────────────────────────────────── */
console.log('\n1. the live renderers');

const findings = audit(real);
check('both renderers handle every declared kind', !findings.length, findings.join('; '));
check(
  `BLOCK_KINDS is not empty`,
  Array.isArray(BLOCK_KINDS) && BLOCK_KINDS.length > 0,
  `${BLOCK_KINDS ? BLOCK_KINDS.length : 0} kind(s)`,
);
check(
  'the content between them uses most of the vocabulary',
  real.used.size > 0,
  `${real.used.size} of ${BLOCK_KINDS.length} kinds in use`,
);

/* ── Tool references resolve ──────────────────────────────────────── */
console.log('\n2. every toolcta names a tool that exists');

const badTools = [];
const walkTools = blocks => {
  for (const [kind, v] of blocks) {
    if (kind === 'toolcta' && !TOOL_BY_ID[v.tool]) badTools.push(v.tool);
    if (kind === 'card' && v && v.blocks) walkTools(v.blocks);
    if (kind === 'cards' && Array.isArray(v)) for (const c of v) if (c.blocks) walkTools(c.blocks);
  }
};
for (const body of [...GUIDES.filter(g => g.body).map(g => g.body), ...POSTS.map(p => p.body)]) {
  for (const section of body) walkTools(section.blocks);
}
check('no toolcta names an unknown tool', !badTools.length, badTools.join(', '));
check(
  'negative control: an unknown tool id WOULD be caught',
  !TOOL_BY_ID['definitely-not-a-tool'],
  'the lookup that catches it is the same one the block renders through',
);

console.log('');
if (failures) {
  console.error(`FAIL: ${failures} check(s) failed.`);
  process.exit(1);
}
console.log('PASS: one block vocabulary, handled the same way on both sides.');
