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

   WHAT IT CANNOT CATCH, stated plainly so nobody trusts it further than
   it goes: a survival claim written without a percentage ("Argentine
   stock survives best"), a number attributed in a neighbouring sentence
   rather than the same one, and anything in a client email, which is
   not in this repository at all. It narrows the blast radius of the
   mistake that actually happened. It does not make the mistake
   impossible.

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
  // '80.0%': 'public_numbers section 3, survival by account country',
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
const MEASUREMENT_CLAIM =
  /\b(our (?:own )?survival data|our benchmark|in our benchmark|survival rates? across our|our (?:worst|best)-performing|we measured[^.]{0,50}surviv)\b/i;

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

/* Sentence-ish: split on terminators followed by a space or end. Crude on
   purpose - a smarter parser would have to understand the JSX string
   literals this reads, and the unit under test is a sentence a human
   wrote, not a syntax tree. */
function sentences(text) {
  return text.split(/(?<=[.!?])\s+/);
}

const source = fs.readFileSync(path.join(ROOT, 'catalog.jsx'), 'utf8');

/* Only the prose. A percentage inside a code identifier or a class name is
   not a claim about anything. */
const prose = [...source.matchAll(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g)]
  .map((m) => m[1] ?? m[2] ?? '')
  .filter((s) => s.length > 40);

console.log('Survival claims: a number attributed to us must be one we can reproduce');

const allPercents = [...source.matchAll(PERCENT)].length;
const offenders = [];
let attributedSentences = 0;

for (const block of prose) {
  for (const sentence of sentences(block)) {
    const found = sentence.match(PERCENT);
    if (!found) continue;
    if (!SURVIVAL_WORDS.test(sentence)) continue;
    if (!ATTRIBUTION.test(sentence)) continue;
    attributedSentences++;
    for (const pct of found) {
      if (!(pct in ATTRIBUTED_NUMBERS)) {
        offenders.push({ pct, sentence: sentence.trim().slice(0, 150) });
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

check(
  'no survival percentage is attributed to us without a reproducible source',
  offenders.length === 0,
  offenders.length
    ? offenders.map((o) => `${o.pct} -> "${o.sentence}"`).join(' | ')
    : 'none found',
);

/* ── Rule 2 over the same prose ─────────────────────────────────────── */
const claims = [];
for (const block of prose) {
  for (const sentence of sentences(block)) {
    if (!MEASUREMENT_CLAIM.test(sentence)) continue;
    const trimmed = sentence.trim();
    if (PENDING_REWRITE.some((known) => trimmed.startsWith(known))) continue;
    claims.push(trimmed.slice(0, 150));
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
    const found = sentence.match(PERCENT);
    if (!found) continue;
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

function scanClaims(text) {
  return sentences(text).filter(
    (s) => MEASUREMENT_CLAIM.test(s) &&
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
