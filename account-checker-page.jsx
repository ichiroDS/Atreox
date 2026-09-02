/* ══════════════════════════════════════════════════════════════════
   account-checker-page.jsx — /tools/account-checker.

   The second free tool. Upload a Telegram session and see the plain
   facts Telegram reports about it — can it post, its spam status
   (panel only), approximate age, data centre and device. No score.

   Same funnel shape as the proxy checker: genuinely free, three checks
   an hour, and the wall at a batch is the invitation into the panel.
   The working tool (AccountCheckerWidget, in tool-checker.jsx) sits
   first; everything below explains it.

   Head/canonical/OG/sitemap come from SITE_PAGES in prerender.mjs, and
   the route is wired in app.jsx — the same mechanism every page uses.
══════════════════════════════════════════════════════════════════ */

const React = window.React;
const {
  ArrowUpRight, Server, Shield, Zap, Globe, Cpu,
  FooterBar, CrossLinks,
  PageHero, PageSection, SectionLockup, Pill, MONO, SERIF,
  AccountCheckerWidget,
} = window;

const ACCENT = window.ACCENT;
const ACCENT_RGB = window.ACCENT_RGB;
const PANEL_URL = 'https://app.atreoxai.com/tools/account-checker';

const READINGS = [
  {
    icon: Zap,
    title: 'Can it post — the real test',
    body: 'A silent write test that separates a write-banned account from a working one: Telegram refuses the probe for a banned account exactly as it refuses a real message. Nothing is sent and nothing is joined.',
  },
  {
    icon: Server,
    title: 'Age, data centre, device',
    body: 'The account’s home data centre and the device on the current session, straight from Telegram. Plus an approximate age read from the account ID — labelled approximate, because the ID is a fact and the date it maps to is an estimate.',
  },
  {
    icon: Shield,
    title: 'Flags Telegram already set',
    body: 'Whether the account is marked scam, fake or restricted, and whether it carries Premium — read from the account itself, not guessed.',
  },
  {
    icon: Globe,
    title: 'Facts, not a verdict',
    body: 'No health score, no survival prediction. The tool reports what Telegram reports and lets you decide. The panel adds the spam-limit status, batches and a saved history.',
  },
];

const FACTS = [
  ['Only your own accounts', 'A session file is a live credential. Never upload one that isn’t yours — the tool acts on the account it is given.'],
  ['Deleted immediately', 'Your session runs this one check and is deleted the instant it finishes — never written to our database, our logs, or any error message. We keep only anonymised facts and a one-way fingerprint.'],
  ['Some checks are panel-only', 'Reading the spam limit means messaging @SpamBot — an action on the account. The free checker takes no action on your behalf, so the spam status is available in the panel, on your own accounts.'],
  ['Free, right here', 'Three checks an hour, no account. A whole partya at once, with no limit and a saved history, is the panel — included with any module.'],
];

function CtaButton({ children }) {
  return (
    <a href={PANEL_URL}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 9,
        border: `1px solid rgba(${ACCENT_RGB},0.45)`,
        background: `rgba(${ACCENT_RGB},0.10)`,
        boxShadow: `0 0 18px rgba(${ACCENT_RGB},0.14)`,
        borderRadius: 3, padding: '13px 22px', textDecoration: 'none',
        fontFamily: MONO, fontWeight: 600, fontSize: '0.68rem',
        letterSpacing: '0.18em', textTransform: 'uppercase', color: ACCENT,
      }}>
      {children} <ArrowUpRight size={14} />
    </a>
  );
}

function AccountCheckerPage({ setPage }) {
  return (
    <div>
      <PageHero
        badge="FREE TOOL"
        title="Telegram account checker"
        sub="Upload a session and see what Telegram reports about the account — whether it can post, its age, data centre and device. No score, no guess. The session is deleted the instant the check finishes."
      />

      <PageSection>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 22 }}>
          <Pill dot>Free — 3 checks/hour, no account</Pill>
          <Pill muted>Session deleted immediately</Pill>
        </div>

        <div style={{ marginBottom: 52 }}>
          <AccountCheckerWidget />
        </div>

        <SectionLockup title="What it tells you">
          Whether an account is reachable is easy. Whether it can actually do the
          one thing it was bought for — post — is the question this answers.
        </SectionLockup>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
          {READINGS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="panel ticks" style={{ padding: '28px 26px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ color: ACCENT }} aria-hidden="true"><Icon size={18} /></span>
              <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '1.25rem', color: 'white', letterSpacing: '-0.01em', lineHeight: 1.2 }}>{title}</span>
              <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.7 }}>{body}</span>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection style={{ paddingTop: 0 }}>
        <SectionLockup title="Before you use it">
          The things worth knowing up front, rather than after.
        </SectionLockup>

        <div style={{ display: 'grid', gap: 0 }}>
          {FACTS.map(([term, detail]) => (
            <div key={term} style={{
              display: 'grid', gridTemplateColumns: 'minmax(180px, 240px) 1fr', gap: 24,
              padding: '20px 0', borderTop: '1px solid var(--g-14)',
            }}>
              <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.66rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: `rgba(${ACCENT_RGB},0.75)` }}>{term}</span>
              <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.94rem', color: 'rgba(255,255,255,0.62)', lineHeight: 1.75 }}>{detail}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40 }}>
          <CtaButton>Go unlimited in the panel</CtaButton>
        </div>
      </PageSection>

      <CrossLinks current="tools" setPage={setPage} />

      <div style={{ padding: '0 5% 64px' }}><FooterBar setPage={setPage} /></div>
    </div>
  );
}

Object.assign(window, { AccountCheckerPage });
