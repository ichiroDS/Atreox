/* ══════════════════════════════════════════════════════════════════
   lastmod.mjs — the content-hash manifest behind every <lastmod> in
   the sitemap, and the rule that keeps it honest.

   WHAT THE MANIFEST IS FOR. Every URL used to carry the date of the
   build, rewritten on every deploy. A sitemap claiming the whole site
   changed today, every day, teaches a crawler that lastmod means
   nothing on this domain — and the pages that lose most from being
   ignored are the newest ones. So each entry's date moves only when a
   hash of its own content moves, and the pairs are committed in
   content-lastmod.json.

   WHY IT HAS TO BE ENFORCED, NOT JUST WRITTEN. Vercel builds from a
   clean checkout and throws the result away. A manifest the build
   REWRITES is a manifest that never comes back to the repository — so
   if content is edited and the committed manifest is not regenerated,
   the hash disagrees on every single deploy, the date is stamped today
   every single deploy, and the exact problem this file exists to fix
   comes back with an extra step of indirection hiding it.

   Nothing about that is visible in the output. The sitemap looks
   normal; only its dates are lying. So the disagreement is a BUILD
   FAILURE, with a message naming the entries and the command to run.

   THREE STATES, AND ONLY ONE OF THEM IS FATAL

     manifest missing entirely   seed it, warn, carry on. A checkout
                                 that has never had one must still
                                 build, and every date being today is
                                 correct on the day you start keeping
                                 track. Said out loud, because on a
                                 build server it means the file was
                                 never committed and every deploy will
                                 re-stamp today.

     manifest present, agrees    the normal case. Dates come from the
                                 file; nothing is written; two builds
                                 in a row produce identical bytes.

     manifest present, disagrees FAIL. Content changed, or content was
                                 added or removed, without
                                 regenerating. `npm run lastmod` fixes
                                 it and the result is committed.
══════════════════════════════════════════════════════════════════ */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const LASTMOD_FILE = 'content-lastmod.json';

/* The two regions prerender.mjs rewrites on every run. Exported so the
   shell fingerprint below and prerender itself use ONE definition each
   — a second copy of either marker is a way for the two to disagree
   about what the shell is. */
export const SLUG_MAP_RE = /\/\* SLUG-MAP \*\/[\s\S]*?\/\* \/SLUG-MAP \*\//;
export const HEAD_RE = /<!-- HEAD:META -->[\s\S]*?<!-- \/HEAD:META -->/;

export function contentHash(value) {
  /* JSON.stringify over source literals is stable: key order is the
     order the keys are written in, and this only has to be consistent
     between two runs over the same files. */
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

/* The shell as it contributes to a router page, minus the two regions
   this build rewrites. Without stripping them the fingerprint would
   change whenever the catalog did, and every router page would claim
   to have changed with it — the same "everything moved today" noise,
   one level down. */
export function shellFingerprint(indexHtml) {
  return contentHash(indexHtml.replace(SLUG_MAP_RE, '').replace(HEAD_RE, ''));
}

export function readManifest(root) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, LASTMOD_FILE), 'utf8'));
  } catch {
    return null; // absent or unreadable - the caller decides what that means
  }
}

/* What the manifest and the content disagree about, in the three ways
   they can. Kept separate rather than reduced to one boolean because
   the message a developer reads should say which kind of disagreement
   it is: a changed article and a deleted guide need the same command
   but are very different things to see in a diff. */
export function diffManifest(entries, manifest) {
  const ids = entries.map(([id]) => id);
  const changed = [];
  const added = [];
  for (const [id, value] of entries) {
    const before = manifest[id];
    if (!before) added.push(id);
    else if (before.hash !== contentHash(value)) changed.push(id);
  }
  const removed = Object.keys(manifest).filter(id => !ids.includes(id));
  return { changed, added, removed, clean: !changed.length && !added.length && !removed.length };
}

/* The dates, plus the manifest that should be on disk. `changed` is
   which entries actually MOVED (as opposed to which are merely new) -
   only used for the drift warning on articles, whose dates are set by
   their author rather than derived here. */
export function resolveDates(entries, manifest, today) {
  const next = {};
  const dates = {};
  const changed = new Set();
  for (const [id, value] of entries) {
    const hash = contentHash(value);
    const before = manifest ? manifest[id] : null;
    if (before && before.hash !== hash) changed.add(id);
    const date = before && before.hash === hash ? before.date : today;
    next[id] = { hash, date };
    dates[id] = date;
  }
  return { dates, next, changed };
}

/* Returns LINES, and none at all for an empty category: a message
   padded with blank gaps where the other two kinds would have been
   reads like something went wrong with the message itself. */
const bullet = (label, ids) =>
  ids.length ? ['', `  ${label}:`, ...ids.map(id => `    - ${id}`)] : [];

export function driftMessage(diff) {
  return [
    `${LASTMOD_FILE} does not match the content.`,
    '',
    'Every <lastmod> in the sitemap comes from that file, and this build',
    'cannot write it back: a deploy builds from a clean checkout and throws',
    'the result away. Left unfixed, the dates below would be stamped with',
    'the build date on every single deploy - which is the exact problem the',
    'manifest exists to prevent.',
    ...bullet('content changed since the manifest was written', diff.changed),
    ...bullet('new, with no entry in the manifest', diff.added),
    ...bullet('in the manifest but no longer in the content', diff.removed),
    '',
    'Fix, then commit the result:',
    '',
    '    npm run lastmod',
    '',
  ].join('\n');
}
