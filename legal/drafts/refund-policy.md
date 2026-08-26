# Refund Policy — DRAFT

**Last updated: [DATE ON PUBLICATION]**

> The live Terms no longer promise a 30-day money-back guarantee — that
> sentence was removed on 2026-08-27 and replaced with an interim
> paragraph that this document is meant to supersede. Nothing on the site
> currently contradicts what is below.

---

## Read this first: the 7-day window and the 14-day right

You decided to treat customers as consumers. That decision has a
consequence for this document that is worth stating plainly before the
clauses, because it is not obvious and it changes what the policy is
actually worth.

**EU consumers have a statutory 14-day right of withdrawal on distance
contracts.** It is stronger than the 7-day goodwill window in section 3
and it cannot be shortened by a policy. So as things stand today, section
3 does not really govern: a consumer who asks for their money back on day
10 is exercising a statutory right, not our goodwill, and gets a refund.

There is exactly one lawful way to change that, and it is not a wording
change:

- **Obtain the waiver at checkout.** For a digital service, the
  withdrawal right can be waived — but only if the customer *expressly
  consents* to the service starting immediately *and acknowledges losing*
  the right. That consent has to be captured in the Stripe Checkout flow,
  as an affirmative act, and recorded. Written here, it is worth nothing.

So there are two coherent positions, and they are commercial rather than
legal choices:

**(a) Take the waiver.** Section 3's 7-day window then becomes a real,
voluntary offer sitting on top of no statutory obligation — genuinely
more generous than the law requires, and provable. Costs: a checkout
change, and a checkbox that some buyers will read as a warning.

**(b) Do not take the waiver.** Consumers keep 14 days. Section 3 should
then be rewritten to say 14 days plainly rather than 7, because promising
less than the law gives is both pointless and looks bad when someone
notices. Costs: up to two weeks of API spend recoverable by anyone who
asks, with no usage threshold we can enforce against a statutory right.

> `[DECISION]` **(a) or (b).** My recommendation is **(a)**: without a
> free trial the service genuinely does start work immediately, which is
> exactly the situation the waiver exists for, and it is the only version
> in which our 7-day offer means anything. But it is a checkout change and
> a conversion question, so it is yours.
>
> Until this is decided, the rest of this document is written for (a).
> Under (b), section 3 becomes "14 days, no usage condition" and the
> threshold in it goes away.

> `[LAWYER]` Whether the waiver, if we implement it, is validly obtained
> by the Stripe Checkout configuration we end up with — what exactly must
> be shown, in what wording, and what has to be retained as proof.

---

## 1. Scope

This policy covers subscription fees paid to ATREOX AI through Stripe. It
forms part of the Terms of Service and does not limit the statutory rights
described in section 2.

## 2. Statutory rights (EU/EEA consumers)

We treat our customers as consumers. Consumers in the EU/EEA have a
14-day right of withdrawal on distance contracts, subject to the
immediate-performance waiver described above.

Nothing in this policy removes rights that cannot be removed by contract.

> `[DECISION]` Some customers are agencies, i.e. businesses. Treating
> everyone as a consumer is the safe direction — it grants more, never
> less — so no change is needed for them. Worth knowing that it is a
> deliberate simplification rather than an oversight.

## 3. New subscriptions — goodwill window

A first subscription can be refunded in full within **7 days** of the
first payment, provided the Service has not been put to substantial use.

**Substantial use** means any of the following has happened on the
account:

- a comment was delivered to a channel, or
- a NeuroDialogs reply was sent, or
- a parser run returned results.

Connecting Telegram accounts, importing proxies, and configuring modules
are **not** substantial use. That is setup, not output — a customer who
spent two days wiring things up and decided it is not for them has
received nothing and should get their money back.

These are counters the dashboard already keeps, so a request can be
answered from our own records rather than argued about.

This window applies once per customer, to a first subscription.

## 4. Renewals

Renewals are not refundable. Subscriptions renew automatically on the
billing date shown in the dashboard and can be cancelled at any time
before it. Cancelling takes effect at the end of the paid period, and the
Service runs until then.

> `[DECISION]` **Annual plans still need an answer.** A customer eleven
> months into an annual term who cancels: nothing, pro-rata refund of
> unused months, or credit? My recommendation remains **nothing
> automatic, with section 5 unaffected** — the annual price is discounted
> in exchange for the commitment, and a pro-rata exit turns it into a
> monthly plan at an annual discount. Pricing decision, not a legal one.

> `[DECISION]` A reminder email before an annual renewal charge. Not
> universally required, but it prevents most annual-renewal disputes
> outright and costs almost nothing. `[LAWYER]` — some jurisdictions do
> require advance notice for auto-renewals above a certain value.

## 5. When the failure is ours

If the Service is materially unavailable, or a defect on our side prevents
a module from doing what it is sold to do, we will put it right. The
normal remedy is **an extension of your subscription, or service credit,
up to a full billing period**. Where an extension is not a sensible
remedy, we refund in cash instead.

**This is not limited to the 7-day window and does not expire.**

This is what we already do: a customer whose service was degraded by our
fault was given a free month. Writing it down changes nothing about our
behaviour — it just means a customer can rely on it instead of hoping.

## 6. What is not refundable

Being explicit here is what makes section 5 credible.

- **Results.** The Service automates activity; it does not promise growth,
  engagement, replies, or any commercial outcome. Absence of results is
  not a defect.
- **Telegram accounts you supplied**, including accounts restricted,
  limited or banned by Telegram. The accounts are yours, sourced by you,
  and Telegram's enforcement is outside our control. The Service reports
  account health so this is visible rather than a surprise.
- **Proxies you supplied**, and failures caused by them.
- **Changes made by Telegram** to its platform, limits or policies that
  reduce or prevent what a module can do.
- **Use contrary to the Terms of Service**, or to Telegram's own terms.
- **Time already served.** Cancelling mid-period does not refund the
  remainder of that period; the Service keeps running until it ends.

> `[LAWYER]` The "no results promised" clause only holds if the marketing
> does not promise results. The site's sales copy needs reading against
> this clause — a disclaimer that contradicts the pricing page is worth
> very little, and that is the most likely place for a mismatch.

## 7. Modules added and removed mid-cycle

This section states what the billing system actually does. It was read out
of the code rather than described from memory, and the two must not drift.

- **Adding** a module takes effect immediately and is charged pro-rata for
  the remainder of the current period.
- **Removing** a module takes effect at the **end of the current billing
  period**. It stays available and paid-for until then, and **there is no
  partial refund** for the remainder — nothing is interrupted, so nothing
  is owed back.
- A scheduled removal can be cancelled before it takes effect, from the
  billing page.

> `[DECISION]` Worth saying this on the billing page at the moment someone
> clicks Remove — "stays active until 14 March, no refund" prevents the
> ticket rather than answering it. Small dashboard change, and I would do
> it regardless of what happens to this document.

## 8. How to request a refund

Use the contact form on the site, or email **hello@atreoxai.com** from the
address on the account, and tell us why. Approved refunds are returned by
Stripe to the original payment method, usually within 5–10 business days.

> `[DECISION]` Response time. The footer already promises Mon–Fri
> 08:00–20:00 CET with weekend messages answered Monday, so whatever goes
> here must not contradict it. "Within two business days" would be
> consistent; anything faster is a promise to keep.

## 9. Chargebacks

Please contact us before opening a chargeback. A chargeback freezes the
disputed amount and takes weeks to resolve, and in almost every case we
can settle it the same day. We may suspend an account with an open
chargeback until it is resolved.

> `[LAWYER]` Whether suspending on an open chargeback is enforceable
> against a consumer, and how it interacts with section 2.

## 10. Changes

We may update this policy. Changes apply to payments made after the
updated version is published, never retroactively to a payment already
taken.

---

> `[DECISION]` **Where this lives.** There is no `/refund` route and no
> footer link. Both are easy, and it should also be linked from the
> pricing page — a refund policy a buyer cannot find before paying is not
> much use to them, and Stripe looks for one when reviewing a dispute.
