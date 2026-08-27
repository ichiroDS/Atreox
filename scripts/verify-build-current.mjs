/* ══════════════════════════════════════════════════════════════════
   verify-build-current.mjs — the generated files must be what the
   sources actually produce.

   WHY THIS EXISTS. Two failures, a month apart, both invisible until
   somebody happened to look:

     1. a6f2bb0 added the mobile CSS to index.html — the template every
        static page is prerendered from — and did not re-run the build.
        The app shell shipped with the fix; all ten guide pages and the
        referral page kept serving the pre-mobile CSS for a month.
     2. The opposite direction: a fix typed straight into a generated
        file, which the next `npm run build` silently overwrote.

   They look like two different mistakes and they are one: nothing ever
   compared the generated files against the sources they come from. One
   check closes both, because both produce the same observable state —
   running the build changes a file that is already on disk:

     - forgot to rebuild  ->  the build now writes the change  ->  differs
     - edited the output  ->  the build now writes it back     ->  differs

   HOW IT WORKS. Reads the current content of everything the build might
   write, runs the real build, and compares. Nothing here hardcodes which
   files are generated — the build itself defines that by what it writes —
   so a new guide page, a new prerendered route or a new asset is covered
   the day it is added rather than the day somebody remembers this file.

   WHAT IS COMPARED, AND WHY IT IS THE WORKING TREE. Every file is judged
   against its own content as it was a moment ago, NOT against HEAD. That
   distinction is the whole of failure 2: a hand-edited generated file is
   already modified before this script runs, so anything that excused
   pre-existing modifications would excuse exactly the mistake being
   looked for. It also keeps the honest case quiet — edit a source, run
   the build, and the rebuild reproduces what is on disk, so nothing is
   flagged however dirty the tree is.

   Unless --write is passed, every file is restored to the byte, so this
   is safe to run on a dirty tree, in a hook, and in CI.

   Usage:
     node scripts/verify-build-current.mjs           check, restore, exit 1 if stale
     node scripts/verify-build-current.mjs --write   check, and keep the rebuild

   Wired into .githooks/pre-commit (installed by `npm install`, see the
   "prepare" script) and .github/workflows/build-current.yml.
══════════════════════════════════════════════════════════════════ */

import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const KEEP = process.argv.includes('--write');

/* Untrimmed on purpose. A porcelain line is "XY<space>PATH", and the code for
   an unstaged modification is " M" — a LEADING SPACE. Trimming the whole
   output eats that space on the first line only, which shifts exactly one
   path by one character: the first file comes back as
   "uides/account-manager.html", and anything done with that path then fails
   on a pathspec that does not exist. */
const gitRaw = (...args) =>
  execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' });

const porcelain = () =>
  gitRaw('status', '--porcelain', '--untracked-files=all')
    .split('\n')
    .filter(Boolean);

const pathOf = (line) => line.slice(3).trim().replace(/^"|"$/g, '');

const trackedFiles = () =>
  gitRaw('ls-files').split('\n').filter(Boolean);

/* ── Volatile output ───────────────────────────────────────────────
   sitemap.xml stamps <lastmod> with the date of the build, so it differs
   every calendar day whatever the sources say. It is compared with those
   stamps masked out, and restored byte-for-byte when that is the only
   difference — otherwise this check would fail every morning, and a check
   that cries wolf daily gets switched off, which is worse than no check.

   Masking is the narrow fix. The broad one is that a lastmod of "today" on
   every page every day is not information — it claims the whole site changed
   daily — and deriving it from each source's last commit date would make the
   field both honest and deterministic. That changes what the sitemap MEANS,
   so it is not being done here in a commit about build hygiene; this comment
   is the note that it is worth doing.
   ────────────────────────────────────────────────────────────────── */
const VOLATILE = {
  'sitemap.xml': (s) => s.replace(/<lastmod>[^<]*<\/lastmod>/g, '<lastmod>MASKED</lastmod>'),
};

/* Line endings are not a stale build. A CRLF checkout rewrites every
   generated file to LF on build, which would otherwise flag the entire output
   on every Windows machine — noise that would get this check disabled inside
   a week. Binary files are compared byte for byte. */
function normalize(file, buf) {
  if (buf.includes(0)) return buf.toString('base64');
  let text = buf.toString('utf8').replace(/\r\n/g, '\n');
  const mask = VOLATILE[file.replace(/\\/g, '/')];
  return mask ? mask(text) : text;
}

const readIfExists = (file) => {
  const full = path.join(ROOT, file);
  return fs.existsSync(full) ? fs.readFileSync(full) : null;
};

function main() {
  /* Snapshot everything the build could possibly write: every tracked file,
     plus anything currently untracked (a generated file that was never
     committed still has to be compared, not silently accepted). Reading them
     is cheap next to running the build, and it removes any need to predict
     which ones are outputs. */
  const candidates = new Set([
    ...trackedFiles(),
    ...porcelain().map(pathOf),
  ]);

  const before = new Map();
  for (const file of candidates) before.set(file, readIfExists(file));

  console.log(`verify-build: snapshotting ${before.size} file(s), then building…`);
  for (const script of ['scripts/build-app.mjs', 'scripts/prerender.mjs']) {
    const res = spawnSync(process.execPath, [script], { cwd: ROOT, stdio: 'inherit' });
    if (res.status !== 0) {
      console.error(`\nverify-build: ${script} FAILED — the build itself is broken.`);
      return res.status ?? 1;
    }
  }

  // Anything the build created that was not there before counts too.
  for (const line of porcelain()) {
    const file = pathOf(line);
    if (!before.has(file)) before.set(file, null);
  }

  const stale = [];
  const restore = [];
  for (const [file, original] of before) {
    const current = readIfExists(file);
    if (original === null && current === null) continue;

    const changed =
      original === null ||
      current === null ||
      normalize(file, original) !== normalize(file, current);

    if (changed) stale.push(file);
    // Restore whenever the bytes moved at all, so a line-ending-only rewrite
    // is undone even though it is not a finding.
    if (current && original && !current.equals(original)) restore.push([file, original]);
    else if (current && original === null) restore.push([file, null]);
  }

  if (!KEEP) {
    for (const [file, original] of restore) {
      const full = path.join(ROOT, file);
      if (original === null) fs.rmSync(full, { force: true });
      else fs.writeFileSync(full, original);
    }
  }

  if (!stale.length) {
    console.log('\nverify-build: PASS — the generated files match what the sources produce.');
    return 0;
  }

  console.error(
    `\nverify-build: FAIL — ${stale.length} generated file(s) do not match what the ` +
      'current sources produce:\n',
  );
  for (const f of stale) console.error(`    ${f}`);
  console.error(
    [
      '',
      'That means one of two things, and the fix is the same for both:',
      '',
      '  - a source was edited and the build was not re-run, so these files are',
      '    still the OLD output and the change is not actually live; or',
      '  - one of these files was edited by hand, and the build has just',
      '    overwritten that edit — the change belongs in the .jsx or .html',
      '    source it is generated from, not in the generated file.',
      '',
      KEEP
        ? 'The rebuild has been left in place (--write). Review it and commit it.'
        : 'Run `npm run build`, check the diff, and commit the result.',
      '',
    ].join('\n'),
  );
  return 1;
}

process.exit(main());
