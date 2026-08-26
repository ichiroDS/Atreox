# Privacy Policy — DRAFT

**Last updated: [DATE ON PUBLICATION]**

> Replaces the live Policy at `/privacy`, which was written for a course
> business ("purchase a course", "marketing communications about
> courses"), describes cookies the site does not currently set, and gives
> a personal Gmail address as the contact for data-subject requests.

> ## GAP: no controller named
>
> **There is no legal entity yet**, so there is no controller to name.
> Left blank deliberately — a placeholder here would be worse than an
> obvious hole, because a privacy policy that names the wrong controller
> is a false statement rather than a missing one.
>
> A privacy policy that does not say who the controller is fails at its
> first obligation, and this is the document EU customers will check.
> Sections that cannot be finished until the entity exists are marked
> `[BLOCKED ON ENTITY]`.

---

## 0. The structural point, before the detail

`[LAWYER]` **This is the review question that matters most here, and it is
not the usual one.**

ATREOX AI handles personal data in **two different roles**, and they carry
different obligations:

1. **As controller** — for our own customers. Name, email, billing and
   subscription data. Straightforward.

2. **As processor, on behalf of the customer** — for everything the
   automation touches. This is the part no existing document mentions, and
   it is substantial:
   - **Telegram accounts the customer uploads** — session strings,
     `api_id`/`api_hash`, phone numbers, display names, bios, avatars.
     These identify real people, whether or not the customer is one of
     them.
   - **Proxy credentials** the customer uploads.
   - **Third parties the automation interacts with.** NeuroDialogs reads
     and replies to direct messages from real Telegram users. The parsers
     collect data about channels and discussion groups and the people
     active in them. Neurocommenting stores the text of posts it comments
     on. **None of these people are our customers, and none of them agreed
     to anything with us.**

If that second role is what it appears to be, the customer is the
controller and we are the processor, which triggers **Article 28** — a
written data-processing agreement with every customer, sub-processor
disclosure, and instructions-only processing. We do not have one today.

I have written the sections below on that assumption. **It needs
confirming, because if it is right, the missing DPA is a bigger gap than
anything wrong with the current text**, and if it is wrong, sections 3 and
4 need restructuring rather than editing.

---

## 1. Who we are

`[BLOCKED ON ENTITY]` — registered name, address and country go here.
Contact: **hello@atreoxai.com**.

> `[DECISION]` Is a **Data Protection Officer** required? Usually not at
> this size, but the test is about the nature and scale of processing, not
> headcount — and "systematic monitoring" is one of the triggers. Given
> what the parsers do, this deserves an actual answer rather than an
> assumption. `[LAWYER]`

> `[BLOCKED ON ENTITY]` If the entity ends up established outside the
> EU/EEA while selling to people inside it, an **EU representative under
> Article 27** may be required. Worth knowing before choosing where to
> incorporate, rather than after — it is one of the few privacy
> consequences that can influence that decision.

## 2. Data we hold as controller (about our customers)

| What | Why | Legal basis |
|---|---|---|
| Name, email, account identifiers | To provide the Service and your account | Contract |
| Billing and subscription data (held by Stripe; we hold identifiers and status) | To take payment and manage subscriptions | Contract |
| Support correspondence | To answer you | Contract / legitimate interests |
| Referral participation and attribution | To run the referral programme | Contract |
| Server and application logs | Security, debugging, abuse prevention | Legitimate interests |

We do not sell personal data. We do not share it for others' marketing.

> `[DECISION]` Do we send marketing email at all? The live policy promises
> consent-based marketing with opt-out. If we do not do it, saying we do is
> both untrue and an obligation we are not meeting. If we plan to, it needs
> a consent mechanism, not just a sentence.

## 3. Data we process on your behalf (as processor)

Processed only to run the modules you have licensed, on your instructions:

- **Telegram account credentials and profile data** you add — session
  strings, `api_id`/`api_hash`, phone number, display name, bio, avatar,
  and account health/status recorded by the Service.
- **Proxy credentials** you add — host, port, username, password.
- **Operational records** — channels monitored, posts commented on and
  their text, comments generated and delivered, direct-message
  conversations handled by NeuroDialogs, parser results.

> `[LAWYER]` Session strings are, in effect, live access credentials to a
> Telegram account. Whether they should be treated as a special category
> of secret with specific handling commitments in this document — and
> whether we should be stating how they are encrypted at rest — is worth a
> view. `[DECISION]` And a factual one for me: **are they encrypted at
> rest today?** They are stored as plain columns in SQLite as far as I can
> see. If the answer is no, that is a security item, not a drafting one,
> and I would raise it as its own piece of work rather than paper over it
> here.

## 4. People who are not our customers

`[LAWYER]` The Service interacts with Telegram users who have no
relationship with us: people who send direct messages that NeuroDialogs
answers, and people whose public activity the parsers record.

Under the processor reading in section 0, the **customer** is the
controller for that data and is responsible for having a lawful basis for
it. That is the position the Terms take, and this document should say so
plainly rather than leave it implied.

Whether that division actually holds — and what we are obliged to do
regardless of it, particularly around transparency toward those people —
is a specialist question and should be asked directly.

## 5. Sub-processors

| Provider | Role | Where |
|---|---|---|
| Stripe | Payments and subscription billing | `[DECISION: confirm]` |
| Clerk | Authentication and user accounts | `[DECISION: confirm]` |
| Vercel | Website and dashboard hosting | `[DECISION: confirm region]` |
| Upstash (Redis) | Referral attribution store | `[DECISION: confirm region]` |
| `[DECISION]` VPS provider | Hosts the engine and the database | `[DECISION: which provider, which country — this is where the customer data actually lives and it must be named]` |
| `[DECISION]` Model provider | Generates comment and reply text | `[DECISION: name it — post text and conversation content are sent to it, which customers are entitled to know]` |

> `[LAWYER]` **International transfers.** Several of these are US-based.
> Each needs a transfer mechanism identified (adequacy, SCCs, or the
> EU–US Data Privacy Framework) and this section should say which.

> `[DECISION]` Adding or replacing a sub-processor normally requires
> notice to customers under a DPA. Worth deciding the notice period now
> rather than the first time we change one.

## 6. How long we keep things

These are the periods the system actually enforces, read from the
retention rules in the engine rather than described from intent:

| Data | Kept |
|---|---|
| Undelivered comment drafts | 30 days |
| Failed send records | 90 days |
| No-account diagnostic records | 7 days |
| Pending posts not yet acted on | 14 days |
| Channel failure history | 30 days |
| **Delivered comments** | **indefinitely** |
| Account, billing and subscription records | For the life of the account, then as required by law |

> `[DECISION]` **Delivered comments are never deleted.** That is a
> deliberate design choice — it is the customer's record of what was
> posted, and the recent retention work verified every delivered comment
> survived intact. But "indefinitely" sits awkwardly with the storage
> limitation principle, and each row holds the source post's text and the
> generated reply. Options: leave as is and justify it as the customer's
> business record; add a long ceiling (24 months?); or make it a
> per-customer setting. My recommendation is a long ceiling with an export
> before deletion, but this is a product decision. `[LAWYER]` on whether
> "indefinitely" is defensible as written.

> `[DECISION]` **What happens on account deletion?** How long until a
> cancelled customer's accounts, proxies and comment history are actually
> erased, and is there an export first? There is no defined answer today
> and the policy needs one.

## 7. Your rights

We treat customers as consumers (see the Terms). If you are in the EU/EEA
or UK, you have the right to access, correct,
delete, restrict or object to processing of your personal data, and to
data portability. Where processing relies on consent, you can withdraw it
at any time.

Requests: **hello@atreoxai.com**. We respond within one month.

If a request concerns data we process **on a customer's behalf** (section
3), we will direct it to that customer, who is the controller for it.

You may also complain to your local supervisory authority.
`[BLOCKED ON ENTITY]` — our lead authority follows from where the entity
is established, and should be named here once it exists. A consumer can
complain to the authority where they live regardless.

## 8. Security

Access to production systems is restricted; traffic is encrypted in
transit; payment card data never touches our servers and is handled
entirely by Stripe.

> `[DECISION]` Keep this short and true. Every specific claim here is one
> we must be able to demonstrate, and the encryption-at-rest question in
> section 3 has to be settled before anything is claimed about it. I would
> rather this section be modest and accurate than reassuring and
> approximate — the live policy's "industry-standard security measures" is
> exactly the sentence that means nothing and is impossible to fail.

> `[DECISION]` **Breach notification.** GDPR gives 72 hours to notify the
> supervisory authority. We have no process. Worth writing one down
> internally, separately from this document.

## 9. Cookies and analytics

**This site sets no cookies for analytics or advertising, and therefore
shows no cookie banner.** That is a deliberate outcome, not an oversight,
and it is worth keeping.

**Analytics.** We use Vercel Web Analytics. It is served from our own
domain (`/_vercel/insights/`), so no third-party host is contacted, and
it sets no cookies. It records aggregate page views and referrers — which
pages are read and roughly where visitors arrived from. It does not build
a profile of you and does not follow you between sites.

**Cookies that are set**, all of them strictly necessary for something
you asked for, and therefore not requiring consent:

| Cookie | Set by | What for | Life |
|---|---|---|---|
| `atreox_ref` | the dashboard | Remembers which partner referred you so their commission is attributed | 90 days, httpOnly |
| Session cookies | Clerk | Keeps you signed in to the dashboard | Session / as set by Clerk |

**Spam protection.** The contact form loads Cloudflare Turnstile, which
checks that a submission comes from a person rather than a script. It sets
no cookies. It loads **only on the contact page** — not while you are
reading a guide.

> `[LAWYER]` The "strictly necessary, so no consent needed" position for
> the referral cookie is the one worth a second opinion. It is set on a
> first visit, before any account exists, and it exists so a third party
> gets paid — which is closer to an affiliate-tracking purpose than to a
> technical necessity, and affiliate cookies are not always treated as
> exempt. If it turns out not to be exempt, the fix is a banner on first
> visit, which would be a real loss and is worth knowing about before
> someone else raises it.

## 10. Children

The Service is not directed at children and we do not knowingly collect
their data. `[DECISION: 16 or 18 — must match the Terms.]`

## 11. Changes

We may update this policy. Material changes will be announced before they
take effect, and the "Last updated" date above will change.

## 12. Contact

**hello@atreoxai.com**

> Not the personal Gmail currently published here. See `README.md`.
