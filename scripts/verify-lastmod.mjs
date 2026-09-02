/* ══════════════════════════════════════════════════════════════════
   verify-lastmod.mjs — editing content without regenerating the
   manifest must STOP the build.

   THE BUG THIS GUARDS. content-lastmod.json is what makes every
   <lastmod> in the sitemap mean "the day this page's content last
   changed" rather than "the day of the build". It is tracked, and a
   deploy builds from a clean checkout and discards whatever the build
   writes — so a build that silently rewrites the manifest never gets
   that rewrite back into the repository. Edit an article, forget to
   regenerate, and the hash disagrees on every deploy, the date is
   stamped today on every deploy, and the sitemap is back to claiming
   the page changed every day. Nothing in the output looks wrong; only
   the dates are lying.

   So prerender.mjs REFUSES to build on a disagreement. This asserts
   that it actually refuses, by making the disagreement happen.

   HOW THE CONTROLS WORK. Each one edits a real tracked file, runs
   `prerender.mjs --check-lastmod` (a mode that reads and reports and
   writes nothing), asserts the exit code and the message, and restores
   the file byte-for-byte in a finally. That is the same shape
   verify-build-current.mjs already uses, and the restore is verified
   rather than assumed: a control that left the tree modified would be
   a worse bug than the one it is testing for.

   Run with:  node scripts/verify-lastmod.mjs
══════════════════════════════════════════════════════════════════ */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LASTMOD_FILE } from './lastmod.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? ` - ${detail}` : ''}`);
  if (!ok) failures++;
};

/* The check-only mode, as an exit code and whatever it said. Never
   writes, so it is safe to run against a tree mid-edit. */
function runCheck() {
  /* spawnSync rather than execFileSync: the seeding notice is a warning
     and goes to stderr, and execFileSync hands back only stdout on a
     successful exit - so a check that PASSES while saying something
     important would have said it into a void. */
  const res = spawnSync(
    process.execPath, [path.join(ROOT, 'scripts', 'prerender.mjs'), '--check-lastmod'],
    { cwd: ROOT, encoding: 'utf8' },
  );
  return { code: res.status ?? 1, output: `${res.stdout || ''}${res.stderr || ''}` };
}

/* Edit a file, run the check, put the file back exactly as it was. The
   restore is in a finally AND verified, because the alternative to
   getting this right is leaving "TEMPORARY" in a tracked source file. */
function withMutation(relPath, mutate, label) {
  const full = path.join(ROOT, relPath);
  const original = fs.readFileSync(full);
  try {
    const mutated = mutate(original.toString('utf8'));
    if (mutated === original.toString('utf8')) {
      throw new Error(`the mutation for "${label}" changed nothing - the anchor it edits has moved`);
    }
    fs.writeFileSync(full, mutated, 'utf8');
    return runCheck();
  } finally {
    fs.writeFileSync(full, original);
    const restored = fs.readFileSync(full);
    if (!restored.equals(original)) {
      console.error(`FATAL: ${relPath} was not restored after the "${label}" control.`);
      process.exit(1);
    }
  }
}

console.log('lastmod: the manifest cannot drift from the content unnoticed');

/* ── The tree as it stands ────────────────────────────────────────── */
console.log('\n1. the committed manifest matches the content');

const clean = runCheck();
check(
  'prerender --check-lastmod exits 0',
  clean.code === 0,
  clean.code === 0 ? clean.output.trim().split('\n').pop() : clean.output.trim(),
);

/* ── Negative controls ────────────────────────────────────────────── */
console.log('\n2. each way the two can disagree stops the build');

/* The one the whole mechanism exists for: prose edited, manifest not
   regenerated. Before enforcement this built happily and re-stamped
   today's date on that page on every deploy, for as long as nobody
   noticed. */
const edited = withMutation(
  'catalog.jsx',
  src => src.replace(
    "['p', \"The foundation of everything in ATREOX is your accounts.",
    "['p', \"TEMPORARY VERIFY MUTATION. The foundation of everything in ATREOX is your accounts.",
  ),
  'content edited without regenerating',
);
check('editing a guide fails the build', edited.code !== 0, `exit ${edited.code}`);
check(
  'and the message names the guide that drifted',
  edited.output.includes('guide:buying-telegram-accounts'),
  edited.output.split('\n').find(l => l.includes('guide:')) || '(not named)',
);
check(
  'and the message says what to run',
  edited.output.includes('npm run lastmod'),
);

/* New content with no entry yet - adding an article and forgetting. */
const added = withMutation(
  LASTMOD_FILE,
  src => {
    const m = JSON.parse(src);
    delete m['post:how-to-check-telegram-account-before-buying'];
    return JSON.stringify(m, null, 2) + '\n';
  },
  'content present, manifest entry missing',
);
check('a missing manifest entry fails the build', added.code !== 0, `exit ${added.code}`);
check(
  'and is reported as new rather than as changed',
  added.output.includes('new, with no entry in the manifest'),
);

/* And the other direction - a manifest entry for content that is gone,
   which is what a deleted or renamed page leaves behind. */
const removed = withMutation(
  LASTMOD_FILE,
  src => {
    const m = JSON.parse(src);
    m['guide:a-guide-that-no-longer-exists'] = { hash: '0'.repeat(16), date: '2020-01-01' };
    return JSON.stringify(m, null, 2) + '\n';
  },
  'manifest entry with no content',
);
check('a stale manifest entry fails the build', removed.code !== 0, `exit ${removed.code}`);
check(
  'and is reported as no longer in the content',
  removed.output.includes('no longer in the content'),
);

/* ── The tree, again ──────────────────────────────────────────────── */
console.log('\n3. the controls left nothing behind');

const after = runCheck();
check('the check still exits 0 after every mutation was undone', after.code === 0, after.output.trim());
check(
  'no verify marker survives in the sources',
  !fs.readFileSync(path.join(ROOT, 'catalog.jsx'), 'utf8').includes('TEMPORARY VERIFY MUTATION'),
);

/* ── The seeding case ─────────────────────────────────────────────── */
console.log('\n4. a missing manifest seeds once instead of failing');

/* Distinct from every case above: an absent file is not a
   disagreement, it is a starting point. It must build - a checkout
   that has never had a manifest is not broken - and it must say so
   loudly, because on a build server an absent file means it was never
   committed and every deploy will re-stamp today. */
const seed = (() => {
  const full = path.join(ROOT, LASTMOD_FILE);
  const original = fs.readFileSync(full);
  try {
    fs.rmSync(full);
    return runCheck();
  } finally {
    fs.writeFileSync(full, original);
    if (!fs.readFileSync(full).equals(original)) {
      console.error(`FATAL: ${LASTMOD_FILE} was not restored.`);
      process.exit(1);
    }
  }
})();
check('an absent manifest does NOT fail the build', seed.code === 0, `exit ${seed.code}`);
check('but it says so, and says to commit it', seed.output.includes('COMMIT IT'));
check(
  'and check mode wrote nothing while doing it',
  fs.existsSync(path.join(ROOT, LASTMOD_FILE)),
  'restored, and the check itself never writes',
);

console.log('');
if (failures) {
  console.error(`FAIL: ${failures} check(s) failed.`);
  process.exit(1);
}
console.log('PASS: content and manifest cannot drift apart without the build saying so.');
