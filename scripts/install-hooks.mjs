/* install-hooks.mjs — points git at the committed hooks directory.
 *
 * Run by npm's "prepare" lifecycle, i.e. on every `npm install`, so a fresh
 * clone gets the pre-commit check without anyone having to be told about it.
 * `core.hooksPath` rather than copying files into .git/hooks: the hook stays
 * a normal tracked file that can be reviewed and changed like any other.
 *
 * FAILS SOFT, ALWAYS. This runs in three places that are not a developer's
 * machine — Vercel's build container, CI, and any `npm ci` in a directory
 * that is not a git checkout — and none of them wants a dependency install to
 * fail because a hook could not be wired up. A hook that is not installed
 * costs a late failure in CI; an install that exits non-zero costs the deploy.
 */

import { execFileSync } from 'node:child_process';

try {
  execFileSync('git', ['rev-parse', '--is-inside-work-tree'], { stdio: 'ignore' });
} catch {
  process.exit(0); // not a git checkout (Vercel, a tarball install) — nothing to do
}

try {
  execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { stdio: 'ignore' });
  console.log('hooks: git core.hooksPath -> .githooks');
} catch (err) {
  console.warn(`hooks: could not set core.hooksPath (${err.message}) — skipping`);
}
