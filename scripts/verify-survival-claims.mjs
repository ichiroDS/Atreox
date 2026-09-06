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
