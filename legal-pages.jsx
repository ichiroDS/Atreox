/* ══════════════════════════════════════════════════════════════════
   legal-pages.jsx — /terms, /privacy, /refund.

   Written from the reviewed drafts in legal/drafts/. Those files stay
   as the working copies with their [DECISION] and [LAWYER] notes; this
   is the published text, and the two are meant to be edited together.

   WHAT IS DELIBERATELY MISSING. There is no legal entity yet, so there
   is no registered name, no controller and no governing law to state.
   Rather than publish a placeholder — a policy naming the wrong data
   controller is a false statement, which is worse than an obvious hole
   — those sections are simply not here:

     - Terms: "Governing law and disputes" is absent entirely.
     - Privacy: "Who we are" is absent, and the lead supervisory
       authority is not named (the right to complain to a local one is
       stated, because that is true regardless).
     - Privacy: the sub-processor list names the providers that are
       known and says plainly that it is not yet complete. Hosting
       regions are not stated because they are not confirmed.

   ONE SUBSTANTIVE DEPARTURE FROM THE DRAFT. refund-policy.md is
   written for the case where the customer waives the statutory
   14-day withdrawal right at checkout, which makes its 7-day goodwill
   window meaningful. That waiver is not implemented — there is no
   consent_collection or custom_text anywhere in the checkout — so the
   14-day right stands and a published 7-day window would promise less
   than the law already gives. The refund page therefore states 14 days
   with no usage condition. If the waiver is added at checkout, this is
   the section to change back.
══════════════════════════════════════════════════════════════════ */

const React = window.React;
const { SectionBadge, FooterBar, BlurText, GlassBtn, ArrowUpRight, ACCENT, ACCENT_RGB } = window;

function LegalPage({ badge, title, lastUpdated, intro, sections, setPage }) {
  return (
    <div>
      <section style={{ paddingTop: 160, paddingBottom: 60, paddingLeft: '5%', paddingRight: '5%', textAlign: 'center', borderBottom: `1px solid rgba(${ACCENT_RGB},0.12)` }}>
        <SectionBadge>{badge}</SectionBadge>
        <BlurText text={title} style={{
          fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500,
          fontSize: 'clamp(2.2rem, 4.2vw, 3.6rem)', color: 'white',
          lineHeight: 1.08, letterSpacing: '-0.01em', marginTop: 22, marginBottom: 16,
        }} delay={80} />
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 400, fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)' }}>
          Last updated: {lastUpdated}
        </p>
      </section>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '72px 5% 40px' }}>
        {intro && (
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.62)', lineHeight: 1.75, marginBottom: 48 }}>
            {intro}
          </p>
        )}

        {sections.map(({ heading, body }, i) => (
          <div key={i} style={{ marginBottom: 48 }}>
            {heading && (
              <h3 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '1rem', color: 'white', marginBottom: 14, letterSpacing: '-0.01em', display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 400, fontSize: '0.66rem', letterSpacing: '0.1em', color: `rgba(${ACCENT_RGB},0.55)` }}>{String(i + 1).padStart(2, '0')}</span>
                {heading}
              </h3>
            )}
            {Array.isArray(body) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {body.map((para, j) => (
                  <p key={j} style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75 }}>
                    {para}
                  </p>
                ))}
              </div>
            ) : (
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75 }}>
                {body}
              </p>
            )}
            {i < sections.length - 1 && (
              <div style={{ height: 1, background: `rgba(${ACCENT_RGB},0.08)`, marginTop: 48 }} />
            )}
          </div>
        ))}

        <div className="panel" style={{ padding: '24px 28px', display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', marginTop: 20 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.88rem', color: 'white', marginBottom: 4 }}>Questions about this policy?</p>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Use the contact form, or email <a href="mailto:hello@atreoxai.com" style={{ color: ACCENT, textDecoration: 'none' }}>hello@atreoxai.com</a></p>
          </div>
          <GlassBtn onClick={() => setPage('contact')}>Contact Us <ArrowUpRight size={14} /></GlassBtn>
        </div>
      </div>

      <div style={{ padding: '0 5% 0' }}><FooterBar setPage={setPage} /></div>
    </div>
  );
}

const UPDATED = 'August 27, 2026';

/* ── Terms of Service ─────────────────────────────────────────────
   From legal/drafts/terms-of-service.md. Section 16 of that draft,
   "Governing law and disputes", is not published: it is blocked on the
   entity, and the previous live text sent disputes to unnamed
   "binding arbitration" under "applicable laws", which against an EU
   consumer is very likely unenforceable. Saying nothing is better than
   saying that.

   Two bullets from the draft's acceptable-use list are also held back:
   the reseller prohibition, because section 2 sells to agencies and a
   ban on operating the product for others contradicts that until
   somebody decides which is intended; and the VAT inclusive/exclusive
   statement in section 6, which depends on the entity.
   ────────────────────────────────────────────────────────────────── */
function TermsPage({ setPage }) {
  const sections = [
    {
      heading: 'What these terms cover',
      body: 'These Terms govern use of ATREOX AI (the "Service") — the website at atreoxai.com, the dashboard at app.atreoxai.com, and the automation engine behind them. By creating an account or paying for a subscription you agree to them. If you are agreeing on behalf of a company, you confirm you are authorised to bind it.',
    },
    {
      heading: 'What the Service does',
      body: [
        'ATREOX AI automates activity on Telegram using accounts you supply. It is sold as modules, each licensed separately: Neurocommenting generates and posts comments on monitored channels; NeuroDialogs answers inbound direct messages; Active Warmup simulates ordinary account activity; Mass Reactions places reactions on posts; Channel Parser discovers channels by keyword; Group Parser discovers discussion groups.',
        'You choose which modules to license. Available features depend on your active subscription.',
      ],
    },
    {
      heading: 'Who we sell to',
      body: 'We treat customers as consumers. Some are agencies acting commercially, but most are individuals running their own channels, and consumer protection is applied to everyone rather than sorted case by case. That is a deliberate simplification in the customer’s favour: it grants more protection, never less.',
    },
    {
      heading: 'Accounts and eligibility',
      body: 'You need an account to use the Service; authentication is handled by our provider (Clerk). You are responsible for your credentials and for everything done under your account. You must be at least 18.',
    },
    {
      heading: 'Telegram accounts you supply — your responsibility',
      body: [
        'This is the clause the product actually turns on, and it deserves reading rather than skimming. The Service operates Telegram accounts that you add to it.',
        'You confirm that, for every account you add: you own it or are authorised to operate it, and you are not adding an account belonging to someone else without their permission; you obtained it lawfully, and adding it to the Service does not breach any agreement you have with anyone; you accept the consequences of automating it, since Telegram restricts, limits and bans accounts at its own discretion — we surface account health so problems are visible, but we do not and cannot prevent enforcement by Telegram; and you are responsible for what is posted from it.',
        'Content is generated by a language model from instructions and persona settings that you control. It is published under your accounts, to audiences you choose. It is your content.',
        'You give us permission to operate those accounts on your behalf, for the purpose of running the modules you have licensed, for as long as your subscription lasts.',
      ],
    },
    {
      heading: 'Acceptable use',
      body: [
        'You must not use the Service to: send spam, scams, phishing, malware, or misleading financial promotions; harass, threaten, or target individuals; publish content that is unlawful where it is published or where you are; impersonate a real person or organisation; or interfere with, overload, reverse-engineer or attempt to gain unauthorised access to any part of the Service.',
        'We may suspend an account we reasonably believe is being used this way. Where practical we will ask first; where the risk is immediate we may act first and explain afterwards.',
      ],
    },
    {
      heading: 'Subscriptions, billing and modules',
      body: [
        'Subscriptions are monthly or annual, charged through Stripe. There is no free trial — the first charge is taken at signup. Subscriptions renew automatically until cancelled; you can cancel any time before the renewal date, and access continues to the end of the paid period.',
        'Adding a module takes effect immediately and is charged pro-rata for the rest of the current period. Removing a module takes effect at the end of the current billing period: it stays available until then, and there is no partial refund for the remainder. A scheduled removal can be cancelled before it takes effect.',
        'Prices may change. Changes apply from your next renewal, with 30 days’ notice. Taxes are handled by Stripe based on your billing location.',
        'Refunds are covered by the Refund Policy, which forms part of these Terms.',
      ],
    },
    {
      heading: 'Referral programme',
      body: [
        'If you take part, you earn 25% recurring commission on subscription payments made by customers you refer, for as long as they remain subscribed. Attribution is by referral link and lasts 90 days from the first visit.',
        'Self-referral does not qualify — you cannot refer yourself, or an account you control. Commission is not earned on payments that are refunded or charged back, and may be reversed if a payment is reversed. We may change or end the programme with notice; commissions already earned are not affected.',
        'Commission is accrued automatically and shown in your dashboard. Payment is arranged individually — contact us to be paid out.',
      ],
    },
    {
      heading: 'Availability',
      body: 'We aim to keep the Service running but do not guarantee uninterrupted availability. Maintenance, upstream failures, and changes made by Telegram can all interrupt it. Where an interruption is our fault, the Refund Policy sets out the remedy.',
    },
    {
      heading: 'Your content and data',
      body: [
        'You keep ownership of everything you put into the Service: channel lists, persona settings, prompts, and the content generated under your accounts. You grant us only the permission needed to operate the Service for you.',
        'We do not use your data, your generated comments, or your conversations to train models.',
        'Personal data is covered by the Privacy Policy.',
      ],
    },
    {
      heading: 'Our intellectual property',
      body: 'The Service — its software, interface, documentation and guides — belongs to us. These Terms grant you a limited, non-exclusive, non-transferable right to use it while subscribed. They do not transfer ownership of anything.',
    },
    {
      heading: 'Third-party services',
      body: 'The Service depends on third parties including Telegram, Stripe, Clerk, and the providers of the language models that generate text. We are not responsible for their availability, their decisions, or changes they make. Your use of Telegram remains subject to Telegram’s own terms.',
    },
    {
      heading: 'Suspension and termination',
      body: 'You can cancel at any time from the dashboard. We may suspend or terminate an account for breach of these Terms, non-payment, or where required by law. On termination your access ends; data handling is covered by the Privacy Policy.',
    },
    {
      heading: 'Disclaimers',
      body: 'The Service is provided "as is". We do not warrant that it will be uninterrupted or error-free, and we do not promise any commercial result — reach, engagement, replies, growth or revenue. Automation produces activity, not outcomes.',
    },
    {
      heading: 'Limitation of liability',
      body: [
        'To the maximum extent permitted by law, we are not liable for indirect or consequential loss, lost profits, lost opportunities, or loss of, or damage to, Telegram accounts — including restriction or banning by Telegram.',
        'Nothing in these Terms excludes or limits liability that cannot lawfully be excluded or limited, including liability for death or personal injury caused by negligence, for fraud, or any statutory rights you have as a consumer.',
      ],
    },
    {
      heading: 'Changes to these Terms',
      body: 'We may update these Terms. Material changes will be announced at least 14 days before taking effect, by email or in the dashboard.',
    },
    {
      heading: 'Contact',
      body: 'hello@atreoxai.com — Mon–Fri, 08:00–20:00 CET.',
    },
  ];
  return (
    <LegalPage
      badge="Legal"
      title="Terms of Service."
      lastUpdated={UPDATED}
      intro="These terms replace an earlier version written for a different product. They describe what ATREOX AI actually is: automation software that runs Telegram accounts you supply."
      sections={sections}
      setPage={setPage}
    />
  );
}

/* ── Privacy Policy ───────────────────────────────────────────────
   From legal/drafts/privacy-policy.md.

   Section 1, "Who we are", is not published. It is the registered name
   and address of a controller that does not exist yet, and a privacy
   policy naming the wrong controller is a false statement rather than
   an incomplete one.

   The lead supervisory authority is likewise not named — it follows
   from where the entity is established. The right to complain to a
   local authority is stated, because that one is true regardless.

   The sub-processor table names the providers that are known from the
   code and says outright that it is not complete. Hosting regions are
   not given because they have not been confirmed, and a guessed region
   in a transfers section is exactly the kind of confident wrong answer
   this document should not contain.
   ────────────────────────────────────────────────────────────────── */
function PrivacyPage({ setPage }) {
  const sections = [
    {
      heading: 'Two roles, and why it matters',
      body: [
        'ATREOX AI handles personal data in two different roles. As a controller, for our own customers: name, email, billing and subscription data. As a processor, on your behalf, for everything the automation touches — the Telegram accounts you upload, the proxies you add, and the people the automation interacts with.',
        'That second role is the substantial one. NeuroDialogs reads and replies to direct messages from real Telegram users. The parsers collect data about channels and discussion groups. Neurocommenting stores the text of posts it comments on. For that data you are the controller and we act on your instructions.',
      ],
    },
    {
      heading: 'Data we hold as controller',
      body: [
        'About our customers: your name, email and account identifiers, to provide the Service and your account. Billing and subscription data, held by Stripe — we hold identifiers and status — to take payment and manage subscriptions. Support correspondence, to answer you. Referral participation and attribution, to run the referral programme. Server and application logs, for security, debugging and abuse prevention.',
        'We do not sell personal data. We do not share it for anyone else’s marketing.',
      ],
    },
    {
      heading: 'Data we process on your behalf',
      body: [
        'Processed only to run the modules you have licensed, on your instructions: Telegram account credentials and profile data you add — session strings, api_id and api_hash, phone number, display name, bio, avatar, and the account health status recorded by the Service. Proxy credentials you add: host, port, username, password.',
        'Operational records: channels monitored, posts commented on and their text, comments generated and delivered, direct-message conversations handled by NeuroDialogs, and parser results.',
      ],
    },
    {
      heading: 'Account checker — uploaded sessions',
      body: [
        'The free account checker lets you upload a Telegram session file to check one of your own accounts. That file is a live credential and we treat it as one: it is used only for the check you asked for and deleted the moment it finishes — always, including if the check fails — with a background sweep removing anything a failed check might leave behind. We never write the session, its contents, your phone number, or your account’s numeric ID to our database, our logs, or any error message. We keep only anonymised facts about the account (whether it can post, its approximate age, data centre and device) and a one-way fingerprint that lets your own history line up over time — never anything that identifies the account or you.',
        'The public checker keeps what it does on your account to the minimum needed to answer “can this account post”: a single typing signal that creates no message and leaves no trace in any chat. It does nothing else on your behalf — in particular it does not message @SpamBot — so the spam-limit status is available only in the panel, on your own accounts.',
      ],
    },
    {
      heading: 'People who are not our customers',
      body: 'The Service interacts with Telegram users who have no relationship with us — people who send direct messages that NeuroDialogs answers, and people whose public activity the parsers record. For that data the customer is the controller and is responsible for having a lawful basis for it. That is the position the Terms take, and it is stated here plainly rather than left implied.',
    },
    {
      heading: 'Sub-processors',
      body: [
        'Stripe handles payments and subscription billing. Clerk handles authentication and user accounts. Vercel hosts the website and dashboard. Upstash (Redis) stores referral attribution. The language models that generate comment and reply text are provided by OpenAI, Anthropic, Google, xAI and Moonshot, depending on which model you select in the dashboard — the text of the post being commented on, and the conversation being replied to, is sent to the selected provider.',
        'This list is not yet complete: the provider hosting the automation engine and its database is not named here, and the hosting regions and international-transfer mechanisms for the providers above are not yet stated. Both will be added rather than guessed at.',
      ],
    },
    {
      heading: 'How long we keep things',
      body: [
        'These are the periods the system actually enforces, read from the retention rules in the engine rather than described from intent. Undelivered comment drafts: 30 days. Failed send records: 90 days. No-account diagnostic records: 7 days. Pending posts not yet acted on: 14 days. Channel failure history: 30 days.',
        'Delivered comments are kept indefinitely — they are your record of what was posted under your accounts. Account, billing and subscription records are kept for the life of the account, then as required by law.',
      ],
    },
    {
      heading: 'Your rights',
      body: [
        'We treat customers as consumers (see the Terms). If you are in the EU/EEA or the UK, you have the right to access, correct, delete, restrict or object to processing of your personal data, and to data portability. Where processing relies on consent, you can withdraw it at any time.',
        'Requests go to hello@atreoxai.com and we respond within one month. If a request concerns data we process on a customer’s behalf, we will direct it to that customer, who is the controller for it.',
        'You may also complain to the data protection supervisory authority where you live.',
      ],
    },
    {
      heading: 'Security',
      body: 'Access to production systems is restricted; traffic is encrypted in transit; payment card data never touches our servers and is handled entirely by Stripe.',
    },
    {
      heading: 'Cookies and analytics',
      body: [
        'This site sets no cookies for analytics or advertising, and therefore shows no cookie banner. That is a deliberate outcome, not an oversight.',
        'We use Vercel Web Analytics. It is served from our own domain, so no third-party host is contacted, and it sets no cookies. It records aggregate page views and referrers — which pages are read and roughly where visitors arrived from. It does not build a profile of you and does not follow you between sites.',
        'Two cookies are set, both strictly necessary for something you asked for: atreox_ref, set by the dashboard, remembers which partner referred you so their commission is attributed, and lasts 90 days; and session cookies set by Clerk, which keep you signed in to the dashboard.',
        'The contact form loads Cloudflare Turnstile, which checks that a submission comes from a person rather than a script. It sets no cookies, and it loads only on the contact page — not while you are reading a guide.',
        'Videos are not embedded. Where a page shows a video, what is on the page is an image served from this site and a play button: no player, no YouTube script, and no request to Google. Pressing play is what loads the video, from youtube-nocookie.com, and YouTube may then set cookies in your browser — which is why the button says so before you press it. If you do not press it, nothing of Google’s is loaded at all.',
      ],
    },
    {
      heading: 'Children',
      body: 'The Service is not directed at anyone under 18 and we do not knowingly collect their data.',
    },
    {
      heading: 'Changes',
      body: 'We may update this policy. Material changes will be announced before they take effect, and the "Last updated" date above will change.',
    },
    {
      heading: 'Contact',
      body: 'hello@atreoxai.com',
    },
  ];
  return (
    <LegalPage
      badge="Legal"
      title="Privacy Policy."
      lastUpdated={UPDATED}
      intro="This policy replaces an earlier version written for a different product, which described cookies this site does not set. One section is deliberately absent: we are not yet incorporated, so there is no registered entity to name as data controller, and naming a placeholder would be worse than the gap."
      sections={sections}
      setPage={setPage}
    />
  );
}

/* ── Refund Policy ────────────────────────────────────────────────
   From legal/drafts/refund-policy.md, with one deliberate departure
   documented at the top of this file: 14 days, not the draft's 7, and
   with no usage condition, because the checkout does not take the
   statutory-withdrawal waiver that would make a 7-day window mean
   anything. Promising less than the law gives is both pointless and
   looks bad when somebody notices.
   ────────────────────────────────────────────────────────────────── */
function RefundPage({ setPage }) {
  const sections = [
    {
      heading: 'Scope',
      body: 'This policy covers subscription fees paid to ATREOX AI through Stripe. It forms part of the Terms of Service and does not limit the statutory rights described below.',
    },
    {
      heading: 'Statutory rights',
      body: [
        'We treat our customers as consumers. Consumers in the EU/EEA have a 14-day right of withdrawal on distance contracts, and we do not ask you to waive it at checkout.',
        'So: you can cancel a new subscription within 14 days of the first payment and get your money back, without needing a reason and without a usage condition. Nothing in this policy removes rights that cannot be removed by contract.',
      ],
    },
    {
      heading: 'Renewals',
      body: 'Renewals are not refundable. Subscriptions renew automatically on the billing date shown in the dashboard and can be cancelled at any time before it. Cancelling takes effect at the end of the paid period, and the Service runs until then.',
    },
    {
      heading: 'When the failure is ours',
      body: [
        'If the Service is materially unavailable, or a defect on our side prevents a module from doing what it is sold to do, we will put it right. The normal remedy is an extension of your subscription, or service credit, up to a full billing period. Where an extension is not a sensible remedy, we refund in cash instead.',
        'This is not limited to any window and does not expire.',
      ],
    },
    {
      heading: 'What is not refundable',
      body: [
        'Results. The Service automates activity; it does not promise growth, engagement, replies, or any commercial outcome. Absence of results is not a defect.',
        'Telegram accounts you supplied, including accounts restricted, limited or banned by Telegram. The accounts are yours, sourced by you, and Telegram’s enforcement is outside our control — the Service reports account health so this is visible rather than a surprise. The same applies to proxies you supplied and failures caused by them.',
        'Changes made by Telegram to its platform, limits or policies that reduce or prevent what a module can do. Use contrary to the Terms of Service, or to Telegram’s own terms.',
        'Time already served: cancelling mid-period does not refund the remainder of that period, and the Service keeps running until it ends.',
      ],
    },
    {
      heading: 'Modules added and removed mid-cycle',
      body: 'Adding a module takes effect immediately and is charged pro-rata for the remainder of the current period. Removing a module takes effect at the end of the current billing period: it stays available and paid-for until then, and there is no partial refund for the remainder — nothing is interrupted, so nothing is owed back. A scheduled removal can be cancelled before it takes effect, from the billing page.',
    },
    {
      heading: 'How to request a refund',
      body: 'Use the contact form on this site, or email hello@atreoxai.com from the address on the account, and tell us why. Approved refunds are returned by Stripe to the original payment method, usually within 5–10 business days.',
    },
    {
      heading: 'Chargebacks',
      body: 'Please contact us before opening a chargeback. A chargeback freezes the disputed amount and takes weeks to resolve, and in almost every case we can settle it the same day. We may suspend an account with an open chargeback until it is resolved.',
    },
    {
      heading: 'Changes',
      body: 'We may update this policy. Changes apply to payments made after the updated version is published, never retroactively to a payment already taken.',
    },
  ];
  return (
    <LegalPage
      badge="Legal"
      title="Refund Policy."
      lastUpdated={UPDATED}
      intro="What you can get back, when, and what you cannot. This replaces the single paragraph that used to live inside the Terms."
      sections={sections}
      setPage={setPage}
    />
  );
}

Object.assign(window, { PrivacyPage, TermsPage, RefundPage });
