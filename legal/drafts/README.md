# Legal drafts — NOT PUBLISHED, NOT REVIEWED

Three drafts for a lawyer to review: `terms-of-service.md`,
`privacy-policy.md`, `refund-policy.md`. Nothing here is wired into the
site. Nothing here has been read by anyone qualified.

Two markers appear throughout, and they mean different things:

- **`[DECISION]`** — a commercial or product choice only Dmytro can make.
  A lawyer cannot answer these; they need an answer before the clause can
  be finished.
- **`[LAWYER]`** — a point of law I am not qualified to settle. Flagged
  where getting it wrong is expensive, rather than everywhere.

## What is live right now, and what is wrong with it

The premise that the pages are "empty or missing" is half right, and the
half that is wrong is the more urgent half.

**Privacy Policy and Terms of Service exist and are full of prose** —
`legal-pages.jsx`, reachable at `/privacy` and `/terms`, linked from the
footer, "Last updated: April 24, 2026". They are not empty. They are
about a **different product**: a course business.

Quoting the live Terms:

> All content on ATREOX AI — including **course materials, videos,
> workflows**, written content, and software …

> Personal, non-commercial use of **course materials** for your own
> learning is permitted.

> We offer a **30-day money-back guarantee for all paid courses**.

And the live Privacy Policy:

> We collect information you provide directly to us when you create an
> account, **purchase a course**, or contact us.

> We may also use your information to send you marketing communications
> about **courses**, updates, and promotions …

Three consequences worth separating:

1. **The site currently promises a 30-day money-back guarantee.** It says
   "for all paid courses", which is not what is being sold, but a customer
   in a dispute — or a Stripe chargeback reviewer — will read the sentence,
   not the noun. This is the single most exposed thing on the site and it
   is more generous than anything proposed in `refund-policy.md`. See that
   file's opening note.

2. **A personal Gmail is published as the legal contact.** Both the "Your
   Rights" section and the contact panel at the bottom of every legal page
   give `dsevcenko006@gmail.com`. The footer everywhere else on the site
   says `hello@atreoxai.com`. This is almost certainly the answer to "one
   client wrote to a personal email" — it is not that they found it
   somewhere obscure, it is that the Privacy Policy told them to use it,
   twice. It is also the address a GDPR erasure request is contractually
   supposed to go to today.

3. **There is no Refund Policy at all** — no page, no route, no footer
   link. The footer's Legal column is Referral Program, Privacy Policy,
   Terms of Service. Refunds exist only as that one paragraph inside the
   Terms.

**The first two were fixed and deployed on 2026-08-27**, ahead of the
legal review, because both were corrections of statements that were
already wrong rather than new commitments (commit `e3aaa29`):

- The 30-day guarantee is gone. In its place, an interim paragraph saying
  refunds are handled case by case, that our own failures are put right by
  extension or credit, and that EU/EEA consumers' statutory rights
  including withdrawal are unaffected. `refund-policy.md` is meant to
  supersede it.
- All four occurrences of the personal address are now
  `hello@atreoxai.com`, including the one in "Your Rights".

The "courses" language elsewhere in the live pages was left alone — it is
wrong but not a liability, and rewriting it is what these drafts are for.

## What the drafts are grounded in

Everything factual below was read out of the code rather than assumed. If
a fact here is wrong, the drafts are wrong in the same place.

| Fact | Where it comes from |
|---|---|
| Six modules: Neurocommenting, NeuroDialogs, Active Warmup, Mass Reactions, Channel Parser, Group Parser | `atreox-dashboard/lib/stripe/modules.ts` |
| Modules removed mid-cycle drop at period end, via a Stripe Subscription Schedule — no mid-cycle proration back | `lib/stripe/pending-removals.ts` |
| Referral: 25% recurring, for as long as the referred customer stays subscribed | `referral-program.html` meta description |
| Referral attribution: `atreox_ref` cookie, 90 days, httpOnly | `lib/referrals/constants.ts` |
| Processors: Stripe, Clerk, Upstash Redis, Vercel, plus the VPS host | `package.json`, deploy target |
| Customer data at rest: Telegram session strings, `api_id`/`api_hash`, phone, display name, proxy host/port/user/pass, generated comments, source post text, channel lists, avatars, profile fields | `atreox-engine/src/db.py` `accounts` table |
| No analytics and no cookies on the marketing site today | grep for gtag/plausible/posthog/`document.cookie` — nothing |
| No free trial | stated by Dmytro |

**The live Privacy Policy already describes cookies it does not set** —
"analyse site usage, and assist in our marketing efforts". Today the
marketing site sets no cookies and runs no analytics at all. That will
change if the analytics work goes ahead, which is why the cookie section
in the draft is written against the outcome of that decision rather than
against today.

## Decisions taken (2026-08-27)

- **Customers are treated as consumers**, not businesses. Some are
  agencies, but most are individuals running their own channels, and the
  14-day withdrawal right is not something to bet against. This grants
  more protection to everyone rather than sorting case by case.
- **Refund policy accepted as proposed**: 7-day goodwill window on a first
  subscription conditional on no substantial use, our own failures
  remedied without a time limit, results and customer-supplied accounts
  excluded. The usage threshold is checkable against our own counters.
- **Referral programme unchanged.** Its terms are already described on the
  site and stand. Payout is made personally and by hand; the draft says
  exactly that and nothing more.

## Still blocked, and blocking the most

**There is no legal entity yet.** Everywhere that matters, it is marked
`[BLOCKED ON ENTITY]` and left blank rather than filled with a
placeholder — a policy naming the wrong controller is a false statement,
which is worse than an obvious hole. It blocks the governing-law clause,
the VAT treatment, the controller identity, the supervisory authority,
and whether an Article 27 EU representative is needed. That last one is
worth knowing *before* choosing where to incorporate rather than after.

## The biggest gap the lawyer should be pointed at

Not the wording anywhere — the **missing Article 28 data-processing
agreement**. See section 0 of `privacy-policy.md`: the service processes
personal data on customers' behalf, including data about people who are
not customers and never agreed to anything with us. If that reading is
right, a DPA with every customer is required and does not exist. It is a
larger exposure than everything wrong with the current text put together,
and it should be asked about explicitly rather than left to be noticed.
