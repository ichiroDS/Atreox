/* ══════════════════════════════════════════════════════════════════
   verify-survival-claims.mjs — a guide may not claim a survival number
   as ours unless that number is one we can currently reproduce.

   WHAT WENT WRONG. Two figures were quoted to a client for a month as
   "our data". One measured days since import rather than the rest time
   the sentence claimed; the other was circular. Both were caught by
   somebody happening to re-run the query. The engine now has
   scripts/public_numbers.py, which prints every figure we can stand
   behind and refuses the rest - but a script nobody is obliged to run
   is a document, not a guard.

   WHY THIS IS NOT "EVERY PERCENTAGE MUST BE IN THE OUTPUT". Measured on
   this catalog: 27 percentages, and 20 of them are product settings -
   "starts at 30% of its caps", "capped at 35% of your pool", "ramps to
   100%". A blanket rule fires on all of those and gets switched off in
   a week, which is worse than no rule.

   Nor is it "every percentage near the word survival". The guides make
   arithmetic arguments with illustrative numbers on purpose - "at 25%
   survival the $0.20 account costs $0.80 per account that lives" is a
   worked example, not a claim, and it is the clearest passage on the
   page.

   SO THE RULE IS ABOUT ATTRIBUTION, NOT ARITHMETIC. What made the
   client letter wrong was not a number; it was "our own survival data
   shows" in front of one. This fails the build when a percentage sits
   in the same sentence as BOTH a survival word and a first-person
   attribution - our, we, ATREOX's own - unless that exact number is in
   ATTRIBUTED_NUMBERS below, which is maintained from the engine
   script's output and cites the section it came from.

   AND THEN WE CHANGED THE FORMAT AND THE GUARD DID NOT FOLLOW. On
   2026-09-10 we decided to publish batch results as RAW FRACTIONS -
   "49 of 50", never "98%" - because n=20 cannot carry a percentage and
   we had told a client in writing that twenty is the sample floor. A
   fraction contains no `%`. So the honest format we deliberately chose
   walked straight past rule 1, which had been written when the mistake
   being prevented was a quoted percentage. The guard was not wrong; it
   was aimed at the old shape of the mistake.

   Rule 1 now reads both. A fraction is normalised to "N of M" and
   looked up in ATTRIBUTED_NUMBERS under that key, so "49/50",
   "49 of 50" and "49 out of 50" are one entry and cannot be added
   three times or forgotten twice.

   WHAT IT CANNOT CATCH, stated plainly so nobody trusts it further than
   it goes: a survival claim written with no number at all ("Argentine
   stock survives best") - rule 2 covers the attributed phrasings of
   that and nothing else - a number attributed in a neighbouring
   sentence rather than the same one, and anything in a client email,
   which is not in this repository at all. It narrows the blast radius
   of the mistake that actually happened. It does not make the mistake
   impossible.

   THIS GUARD SPENT ITS WHOLE LIFE SWITCHED OFF, and the way it happened
   is worth more than the guard. vercel.json's buildCommand used to spell
   the build pipeline out as a second copy of package.json's "build"
   script. This file was added to one list and not the other - so it ran
   only when somebody typed `npm run build` by hand, which nobody does,
   because Vercel is what builds. Every deploy since it was written went
   out unchecked, and nothing anywhere said so: the build passed, because
   the build never ran it.

   Fixed on 2026-09-09 by deleting the second list. vercel.json now says
   `npm run build` and nothing else, so there is one pipeline and adding
   a step to it cannot miss the deploy. Do not re-expand it - a build
   command that enumerates steps is a list that has to be kept in sync
   with another list, and this is what that costs.

   Run:  node scripts/verify-survival-claims.mjs
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

/* Numbers the guides are allowed to attribute to us, and where each one
   comes from. A number gets added here only after `python -m
   scripts.public_numbers` in the engine prints it under a QUOTABLE
   verdict - the entry records which section, so the next person can
   re-run exactly that. Empty is the correct state right now: on the
   current database that script refuses every survival figure it has. */
const ATTRIBUTED_NUMBERS = {
  /* Day 7, 2026-09-14. Every entry below was read off a fresh run of
     (engine) python -m scripts.batch_day_report --cohort <c> --as-of <d>,
     line by line, not from the article and not from memory. Re-run those
     three commands to check any of them; the cohort ids are in
     scripts/batch_day_report.PUBLISHED_COHORTS.

     The report prints its own NOT QUOTABLE verdict on all three, and that is
     not contradicted by publishing them: it refuses them as a SURVIVAL RATE
     because the load was uneven and one account has no current answer. The
     article makes neither claim - it reports counts, says the load was
     uneven, and has a section on what the numbers do not prove. */

  // --- argentina-abontg, --as-of 2026-09-11 --------------------------------
  // "CAN WRITE ... 49 of 50"
  '49 of 50': 'batch_day_report argentina-abontg 2026-09-11, CAN WRITE',
  // "DEAD (neither writes nor reads) 0 of 50"
  '0 of 50': 'batch_day_report argentina-abontg 2026-09-11, DEAD',
  // "NO CURRENT ANSWER ... 1 of 50"
  '1 of 50': 'batch_day_report argentina-abontg 2026-09-11, NO CURRENT ANSWER',
  // "accounts that did ANY write: 20 of 50" - profile templates applied
  // 2026-09-08, three days before the verdicts were taken.
  '20 of 50': 'batch_day_report argentina-abontg 2026-09-11, accounts that did ANY write',

  // --- argentina-theblja-control, --as-of 2026-09-11 -----------------------
  // "CAN WRITE ... 2 of 30"
  '2 of 30': 'batch_day_report argentina-theblja-control 2026-09-11, CAN WRITE',
  // "DEAD ... 28 of 30", each one 'frozen, checked 1.3d ago'
  '28 of 30': 'batch_day_report argentina-theblja-control 2026-09-11, DEAD (all frozen)',
  // "NO CURRENT ANSWER ... 0 of 30"
  '0 of 30': 'batch_day_report argentina-theblja-control 2026-09-11, NO CURRENT ANSWER',

  // --- uzbek, --as-of 2026-09-10 (imported 2026-09-03; Day 7 is the 10th) --
  // "CAN WRITE ... 20 of 20"
  '20 of 20': 'batch_day_report uzbek 2026-09-10, CAN WRITE',
  // "DEAD ... 0 of 20" and "NO CURRENT ANSWER ... 0 of 20"
  '0 of 20': 'batch_day_report uzbek 2026-09-10, DEAD and NO CURRENT ANSWER',
};

/* RULE 2: a claim to HAVE MEASURED survival, with or without a number.
   Rule 1 above only sees percentages, and the two sentences that survived
   the removal of the geo benchmark carry no percentage at all - "Indonesia
   sits in our worst-performing group" is a claim about a table that no
   longer exists and never reproduced. A number guard cannot see that
   sentence; this one can.

   Deliberately separated from a PROMISE. "We publish our own batch results
   as they mature" is a commitment, not evidence, and flagging it would train
   whoever maintains this to stop reading the output. Measured on the current
   catalog: 4 sentences match a loose version of this pattern, 2 of them
   promises; the tightened pattern below matches the 2 claims and neither
   promise. */
/* NO TRAILING \b, and that is a fix rather than a looseness. The pattern
   used to end in one, which silently killed the last alternative: after
   "surviv" comes "al", v-to-a is not a word boundary, so
   "we measured ... survival" could never match. The branch written to
   catch the vaguest and most dangerous phrasing - a claim to have
   measured, with no number for rule 1 to see - was dead from the day it
   was written, and its own negative control passed the whole time
   because that control used the FIRST alternative, which ends at "data"
   and does have a boundary after it.

   Found on 2026-09-12 by pasting a real section into the page and
   noticing the guard stayed silent on "what we measured is survival at
   rest" - the exact sentence shape this branch exists for. A control
   below now exercises this branch specifically, so it cannot die again
   without the build saying so. */
const MEASUREMENT_CLAIM =
  /\b(our (?:own )?survival data|our benchmark|in our benchmark|survival rates? across our|our (?:worst|best)-performing|we measured[^.]{0,50}surviv)/i;

/* Sentences that DO claim a measurement and ARE backed, with the file
   that backs each one.

   Rule 2 was written when we had measured nothing, so "claims to have
   measured survival" and "unsupported" were the same set. Since
   2026-09-11 they are not: logs/day_reports/ holds real Day-7 output for
   three cohorts, and a page that may not say "what we measured is
   survival at rest" cannot state the limitation of its own measurement -
   which is the one sentence a reader most needs.

   EXACT FULL SENTENCE, not a prefix like PENDING_REWRITE. A prefix
   exemption keeps excusing a sentence after somebody rewrites its
   second half, which is where the claim usually is. Reword it by one
   word and it fails again, on purpose. */
const ATTRIBUTED_CLAIMS = {
  'None of these accounts has posted a comment, so what we measured is survival at rest - and a pre-flagged account surfaces when it is used, not while it sits.':
    'engine logs/day_reports/2026-09-11-day7-argentina-abontg.txt and ' +
    '-argentina-theblja-control.txt: both report NO LOAD / load reaching ' +
    '20 of 50, and both end NOT QUOTABLE for exactly this reason. The ' +
    'sentence states the report\'s own limitation.',
};

/* Claims that are in the guides today, are NOT currently supported, and are
   waiting on an author decision about the replacement wording. The build
   passes with these listed and prints them every run, so the debt is loud
   rather than silent - but a NEW unsupported claim fails immediately.

   Both of these derived from the geo benchmark removed on 2026-09-06: the
   "worst-performing group" is that chart's four lowest rows, and "survival
   rates across our whole user base" is its subtitle. With the chart gone,
   nothing stands behind either. They come out of this list the moment the
   section is rewritten. */
const PENDING_REWRITE = [
  // Emptied on 2026-09-06: both entries were rewritten in the same commit
  // that removed the geo benchmark they rested on. An exemption outliving
  // the sentence it excused is how an allowlist becomes permission.
];

const SURVIVAL_WORDS = /\b(surviv\w*|alive|died|dies|dying|death|ban rate|burn rate)\b/i;
const ATTRIBUTION = /\b(our|we|us|ATREOX(?:'s)?|the ATREOX team)\b/i;
const PERCENT = /\d+(?:\.\d+)?%/g;

/* The three ways a fraction is written in English prose, which is the
   format we actually publish in. "of the" is allowed because "48 of the
   50 accounts" is how a person writes it.

   The slash form is the loose one and is filtered below rather than in
   the pattern: a regex tight enough to exclude "24/7" and loose enough
   to include "9/10" does not exist, so the exclusions are named. */
const FRACTION = /\b(\d{1,5})\s*(?:\/|of the|out of|of)\s*(\d{1,5})\b/gi;

/* Slash forms that are idioms, not counts. Named individually on
   purpose: a heuristic ("denominator under 10 is probably an idiom")
   would silently drop "9/10 survived", which is exactly the shape this
   rule exists to catch. */
const SLASH_IDIOMS = new Set(['24/7', '365/24']);

/* A fraction, normalised to the one spelling ATTRIBUTED_NUMBERS is keyed
   on, or null when the pair is not a count at all.

   Rejects a denominator smaller than the numerator ("50 of 49" is not a
   survival figure, it is two numbers that happen to be adjacent), a
   denominator of 0 or 1, and the named slash idioms. Everything that
   survives those is a claim about how many of a batch are alive - which
   is the only reason a fraction would be in a sentence that already
   carries a survival word AND a first-person attribution. */
function normaliseFraction(raw, numerator, denominator) {
  const n = Number(numerator);
  const m = Number(denominator);
  if (SLASH_IDIOMS.has(raw.replace(/\s+/g, ''))) return null;
  if (!Number.isInteger(n) || !Number.isInteger(m)) return null;
  if (m < 2 || n > m) return null;
  return `${n} of ${m}`;
}

/* Every attributable NUMBER in one sentence - percentages and fractions
   together - in the spelling ATTRIBUTED_NUMBERS uses as its key. One
   function so the two forms cannot drift into being checked by two
   slightly different rules, which is how the fraction gap opened in the
   first place. */
function attributableNumbers(sentence) {
  const found = [...(sentence.match(PERCENT) ?? [])];
  for (const match of sentence.matchAll(FRACTION)) {
    const key = normaliseFraction(match[0], match[1], match[2]);
    if (key) found.push(key);
  }
  return found;
}

/* Sentence-ish: split on terminators followed by a space or end. Crude on
   purpose - a smarter parser would have to understand the JSX string
   literals this reads, and the unit under test is a sentence a human
   wrote, not a syntax tree. */
function sentences(text) {
  return text.split(/(?<=[.!?])\s+/);
}

/* EVERY FILE THAT HOLDS PROSE WE PUBLISH, not just the guides.

   This read catalog.jsx and nothing else, which was right for exactly as
   long as catalog.jsx was the only place we wrote sentences. The blog now
   carries the survival article - the one page on the site whose entire
   subject is numbers attributed to us, with sellers named - and it would
   have shipped past this guard without being looked at once. A guard whose
   scope is a file rather than a kind of content stops covering the site
   the first time the site grows.

   Add a file here when a new one starts holding prose. The cost of
   forgetting is not a failed build; it is an unchecked claim. */
const SCANNED_FILES = ['catalog.jsx', 'blog-catalog.jsx'];

const sources = SCANNED_FILES.map((file) => ({
  file,
  text: fs.readFileSync(path.join(ROOT, file), 'utf8'),
}));
const source = sources.map((s) => s.text).join('\n');

/* Only the prose. A percentage inside a code identifier or a class name is
   not a claim about anything. */
const STRING_LITERAL = /'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g;

/* [{ file, text }] rather than a flat list of strings, so a failure can say
   WHICH file to open. With one file that was noise; with two it is the
   difference between a fix and a search. */
const proseBlocks = sources.flatMap(({ file, text }) =>
  [...text.matchAll(STRING_LITERAL)]
    .map((m) => m[1] ?? m[2] ?? '')
    .filter((s) => s.length > 40)
    .map((text) => ({ file, text })),
);
const prose = proseBlocks.map((b) => b.text);

/* TABLE CELLS, which the length filter above deliberately drops and which
   are the most dangerous place a number can hide.

   The survival article's main visual element is a table, and its cells are
   strings like '49 of 50' - eight characters, nowhere near the 40 that marks
   a block of prose. Rule 1 could not see one of them. The headline number of
   the only page on this site whose whole subject is our own measurements was
   the single least-guarded string in the repository.

   A cell has no sentence around it, so there is no survival word and no
   first-person pronoun to gate on. The rule is therefore blunter and that is
   correct: a string which is ENTIRELY a fraction, sitting in a file we
   publish prose from, has to be a number we can reproduce. There is no
   innocent reason for a bare "28 of 30" to be in this repository. */
const BARE_FRACTION = /^\s*(\d{1,5})\s*(?:\/|of the|out of|of)\s*(\d{1,5})\s*$/i;

/* ANCHORED ON THE QUOTES AROUND THE FRACTION, not on the file-wide string
   scan above. That scan pairs quotes across the whole file and loses
   synchronisation the first time an apostrophe appears inside a
   double-quoted sentence - which is most articles - so everything after it
   is mis-sliced. Rule 1 has always tolerated that because a mis-sliced
   block still contains its sentences. A cell cannot tolerate it: the whole
   value is eight characters and a single lost quote hides it completely.
   Measured while writing this: the file-wide scan found ZERO of the six
   fractions in the survival table. */
const QUOTED_FRACTION =
  /(['"])\s*(\d{1,5})\s*(?:\/|of the|out of|of)\s*(\d{1,5})\s*\1/gi;

const fractionCells = sources.flatMap(({ file, text }) =>
  [...text.matchAll(QUOTED_FRACTION)]
    .map((m) => {
      const raw = m[0].slice(1, -1);
      const key = normaliseFraction(raw, m[2], m[3]);
      return key ? { file, raw, key } : null;
    })
    .filter(Boolean),
);

console.log('Survival claims: a number attributed to us must be one we can reproduce');
console.log(`  scanning: ${SCANNED_FILES.join(', ')}`);

const allPercents = [...source.matchAll(PERCENT)].length;
const offenders = [];
let attributedSentences = 0;

for (const { file, text } of proseBlocks) {
  for (const sentence of sentences(text)) {
    const found = attributableNumbers(sentence);
    if (found.length === 0) continue;
    if (!SURVIVAL_WORDS.test(sentence)) continue;
    if (!ATTRIBUTION.test(sentence)) continue;
    attributedSentences++;
    for (const pct of found) {
      if (!(pct in ATTRIBUTED_NUMBERS)) {
        offenders.push({ pct, file, sentence: sentence.trim().slice(0, 150) });
      }
    }
  }
}

check(
  'the rule is narrow enough to survive contact with the catalog',
  allPercents > 0,
  `${allPercents} percentages in the file, ${attributedSentences} of them in a ` +
  'sentence that both mentions survival AND attributes it to us',
);

for (const cell of fractionCells) {
  if (!(cell.key in ATTRIBUTED_NUMBERS)) {
    offenders.push({
      pct: cell.key,
      file: cell.file,
      sentence: `bare cell "${cell.raw}" (a table cell has no sentence to gate on)`,
    });
  }
}

check(
  'no survival number, percentage or fraction, is attributed to us without a reproducible source',
  offenders.length === 0,
  offenders.length
    ? offenders.map((o) => `${o.file}: ${o.pct} -> "${o.sentence}"`).join(' | ')
    : 'none found',
);

/* ── Rule 2 over the same prose ─────────────────────────────────────── */
const claims = [];
for (const { file, text } of proseBlocks) {
  for (const sentence of sentences(text)) {
    if (!MEASUREMENT_CLAIM.test(sentence)) continue;
    const trimmed = sentence.trim();
    if (trimmed in ATTRIBUTED_CLAIMS) continue;
    if (PENDING_REWRITE.some((known) => trimmed.startsWith(known))) continue;
    claims.push(`${file}: ${trimmed.slice(0, 150)}`);
  }
}

check(
  'no NEW claim to have measured survival appears without a source',
  claims.length === 0,
  claims.length ? claims.join(' | ') : 'none beyond the pending list',
);

if (PENDING_REWRITE.length) {
  console.log('');
  console.log(
    `  NOTE: ${PENDING_REWRITE.length} unsupported survival claim(s) still in ` +
    'the guides, listed in PENDING_REWRITE and awaiting a rewrite:',
  );
  for (const known of PENDING_REWRITE) console.log(`        - "${known}..."`);
  console.log('        Both derived from the geo benchmark removed on 2026-09-06.');
  console.log('        Delete the entry when the sentence is rewritten - it is');
  console.log('        not a permanent exemption.');
}

/* NEGATIVE CONTROL. A rule that matches nothing passes for the wrong
   reason, and this one is designed to match nothing most of the time -
   so it is run against a sentence built to trip it, and must trip. The
   second control is the false-positive side: the three shapes that are
   legitimately in the guides today must NOT trip it. */
function scan(text) {
  const out = [];
  for (const sentence of sentences(text)) {
    const found = attributableNumbers(sentence);
    if (found.length === 0) continue;
    if (!SURVIVAL_WORDS.test(sentence)) continue;
    if (!ATTRIBUTION.test(sentence)) continue;
    out.push(...found.filter((p) => !(p in ATTRIBUTED_NUMBERS)));
  }
  return out;
}

check(
  'negative control: a fabricated attributed claim IS caught',
  scan('Our own survival data puts Argentine stock at 80.0% alive.').length === 1,
  'a sentence with a percentage, a survival word and "our"',
);
check(
  'and a product setting is NOT caught',
  scan('A newly enrolled account starts at 30% of its caps and reaches 100%.').length === 0,
  '"starts at 30% of its caps"',
);
check(
  'and an illustrative worked example is NOT caught',
  scan('At 25% survival the $0.20 account costs $0.80 per account that lives.').length === 0,
  'no first-person attribution, so it reads as arithmetic',
);
check(
  'and a survival claim about somebody else is NOT caught',
  scan('Sellers routinely advertise 95% survival on stock that is nothing of the kind.').length === 0,
  'no first-person attribution',
);

/* ── The fraction half, which is the format we actually publish in ──── */
/* 77 of 99 and not 49 of 50, and the reason is worth keeping. These
   controls used a real figure, and the day that figure was legitimately
   added to ATTRIBUTED_NUMBERS for the survival article both controls
   started failing - correctly, because the number was no longer
   unattributed. A control has to be built on a value that will never be
   attributed, or publishing a number breaks the guard that checks it. */
const NEVER_ATTRIBUTED = '77 of 99';
check(
  'negative control: an unattributed FRACTION is caught, in all three spellings',
  scan('Our Argentine batch was 77 of 99 alive.').length === 1 &&
    scan('Our Argentine batch was 77 out of 99 alive.').length === 1 &&
    scan('Our Argentine batch was 77/99 alive.').length === 1,
  'the shape rule 1 could not see before 2026-09-12',
);
check(
  'and all three normalise to ONE key, so one entry excuses all of them',
  scan('Our batch was 77 of 99 alive.')[0] === NEVER_ATTRIBUTED &&
    scan('Our batch was 77/99 alive.')[0] === NEVER_ATTRIBUTED &&
    scan('Our batch was 77 out of 99 alive.')[0] === NEVER_ATTRIBUTED,
  'otherwise the same claim needs three entries and gets one',
);
check(
  'and an ATTRIBUTED fraction in the same shape is NOT caught',
  scan('Our Argentine batch was 49 of 50 alive.').length === 0,
  'the article publishes this one, and the guard has its source',
);
check(
  'and "of the" is read the way a person writes it',
  scan('Our batch had 77 of the 99 accounts still alive.').length === 1,
);
check(
  'a fraction with no attribution is NOT caught',
  scan('A batch that comes back 2 of 30 alive was dead when it was sold.').length === 0,
  'arithmetic about nobody in particular',
);
check(
  'a fraction in a sentence with no survival word is NOT caught',
  scan('We assign 1 of 3 proxies to each account.').length === 0,
);
check(
  'NEGATIVE CONTROL: "24/7" is not a survival fraction',
  scan('Our accounts are watched 24/7 and survival is checked every day.').length === 0,
  'the one real idiom, excluded by name rather than by a heuristic',
);
check(
  'NEGATIVE CONTROL: a pair that is not a count is not a fraction',
  scan('Our survival window moved from 50 of 49 days, which is not a ratio.').length === 0,
  'denominator smaller than numerator',
);
check(
  'a bare table cell is read as a fraction and must be attributed',
  BARE_FRACTION.test('49 of 50') && BARE_FRACTION.test(' 2 of 30 '),
  'the shape the survival table is built from',
);
check(
  'NEGATIVE CONTROL: a cell with words around it is NOT a bare fraction',
  !BARE_FRACTION.test('lost 2 of 30 accounts'),
  'that one is prose and goes through the sentence rule instead',
);
check(
  'NEGATIVE CONTROL: a bare number or a date is not a bare fraction',
  !BARE_FRACTION.test('30 days') && !BARE_FRACTION.test('2026-10-04')
    && !BARE_FRACTION.test('50'),
);
check(
  'NEGATIVE CONTROL: a year or a date is not a fraction',
  scan('We measured our survival on 3 October 2026 and again in 2026.').length === 0,
);

function scanClaims(text) {
  return sentences(text).filter(
    (s) => MEASUREMENT_CLAIM.test(s) &&
      !(s.trim() in ATTRIBUTED_CLAIMS) &&
      !PENDING_REWRITE.some((k) => s.trim().startsWith(k)),
  );
}

check(
  'negative control: a NEW measurement claim without a number IS caught',
  scanClaims('Our own survival data puts Uzbekistan ahead of Poland.').length === 1,
  'no percentage in that sentence at all - rule 1 cannot see it',
);
check(
  'and a promise to publish is NOT caught',
  scanClaims('We publish our own batch results as they mature, including the ones that go against the recommendation.').length === 0,
  'a commitment is not evidence, and flagging it would make this output ignorable',
);
check(
  "and somebody else's claim is NOT caught",
  scanClaims('Sellers advertise survival rates they have never measured.').length === 0,
);
/* The branch that was dead. Asserted on its own rather than left to the
   first control, which passes through a different alternative and so
   proved nothing about this one for as long as it was broken. */
check(
  'negative control: the "we measured ... survival" branch is ALIVE',
  scanClaims('Last month we measured 90% survival across the Argentine stock.').length === 1,
  'it matched nothing at all until 2026-09-12 - a trailing word boundary after "surviv"',
);
check(
  'and it is still bounded - a far-away survival word does not trip it',
  scanClaims('We measured the proxy latency, the login time, the import rate, the template apply time and the join rate, and separately their survival.').length === 0,
  'more than 50 characters between the two, so it is two statements',
);
check(
  'a backed claim is excused, and only by its EXACT sentence',
  scanClaims(Object.keys(ATTRIBUTED_CLAIMS)[0]).length === 0 &&
    scanClaims(Object.keys(ATTRIBUTED_CLAIMS)[0].replace('at rest', 'under load')).length === 1,
  'reword it and the exemption stops applying',
);
check(
  'every backed claim names the file that backs it',
  Object.values(ATTRIBUTED_CLAIMS).every((src) => /day_reports|public_numbers/.test(src)),
  'an exemption with no source is permission',
);
/* The exemption mechanism itself, tested against a synthetic list rather
   than whatever happens to be in PENDING_REWRITE today - the list is empty
   now and a control that depended on it having entries would break the
   moment the debt was paid off, which is the wrong way round. */
function scanWith(text, pending) {
  return sentences(text).filter(
    (s) => MEASUREMENT_CLAIM.test(s) && !pending.some((k) => s.trim().startsWith(k)),
  );
}
const FAKE = ['Our own survival data says X'];
check(
  'an exemption works, and only by exact prefix',
  scanWith('Our own survival data says X and nothing more.', FAKE).length === 0 &&
    scanWith('Our own survival data says Y instead.', FAKE).length === 1,
  'a reworded sentence stops being exempt the moment it changes',
);
check(
  'and the live list is empty, so nothing is currently excused',
  PENDING_REWRITE.length === 0,
  PENDING_REWRITE.length ? PENDING_REWRITE.join(' | ') : 'no standing exemptions',
);

console.log();
if (failures) {
  console.log(`FAIL: ${failures} check(s) failed.`);
  console.log(
    '\nA survival number presented as ours must appear in the output of\n' +
    '  (engine) python -m scripts.public_numbers\n' +
    'under a QUOTABLE verdict, and then be listed in ATTRIBUTED_NUMBERS in\n' +
    'this file with the section it came from. If that script refuses it,\n' +
    'the guide may not claim it either.',
  );
  process.exit(1);
}
console.log('PASS: no unreproducible survival number is attributed to us.');
