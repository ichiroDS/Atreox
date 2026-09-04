
/* ══════════════════════════════════════════════════════════════════
   tools-page.jsx — /tools/proxy-checker.

   The first of the free tools. Its whole job is to explain what the
   checker answers that a generic "is my proxy alive" site cannot —
   the country and data centre TELEGRAM ITSELF reports through the
   proxy — and then send the reader to the panel, where an account is
   required. That last part is the funnel: the tool is genuinely free,
   and the sign-up is the price.

   Head, canonical, OG image and sitemap entry all come from the
   SITE_PAGES table in scripts/prerender.mjs, the same mechanism every
   other route uses. That table is what stopped eight pages declaring
   themselves the home page; adding a row is the whole of it, and
   there is deliberately no per-page canonical written by hand here.
══════════════════════════════════════════════════════════════════ */

const React = window.React;
const {
  ArrowUpRight, Globe, Server, Shield, Zap,
  FooterBar, CrossLinks,
  PageHero, PageSection, SectionLockup, Pill, MONO, SERIF,
  ProxyCheckerWidget,
  ProxyBatchWidget,
} = window;

const ACCENT = window.ACCENT;
const ACCENT_RGB = window.ACCENT_RGB;
const PANEL_URL = 'https://app.atreoxai.com/tools/proxy-checker';

/* What the checker reports, in the order the page argues them: the
   Telegram view first, because it is the one nothing else gives you. */
const READINGS = [
  {
    icon: Server,
    title: 'What Telegram sees',
    body: 'The country and nearest data centre Telegram itself reports through the proxy, from an unauthenticated connection. This is the field an account’s geo is judged against — not where the IP is registered.',
  },
  {
    icon: Globe,
    title: 'The real exit IP',
    body: 'The address the proxy actually comes out of, fetched over an encrypted connection through the proxy so it cannot be misreported — with its country, its network operator and whether that network is a datacenter, a home line or mobile.',
  },
  {
    icon: Zap,
    title: 'Two latencies, separately',
    body: 'How long the proxy takes to accept a connection, and how long Telegram takes to answer through it. A proxy can be quick to connect and slow to Telegram; one number would hide that.',
  },
  {
    icon: Shield,
    title: 'Plain warnings, no score',
    body: 'If the IP’s country and Telegram’s disagree, or the address belongs to a hosting network, the check says so and says what it measured. No rating out of ten, and no guesses about whether an account will survive.',
  },
];

const FACTS = [
  ['No account needed', 'The checker never asks for a Telegram account, a session or a phone number. It cannot: it only ever opens an unauthenticated connection.'],
  ['SOCKS5, HTTP and MTProto', 'MTProto proxies tunnel only Telegram, so for those the exit IP cannot be read at all — the tool says that outright rather than reporting a blank.'],
  ['Nothing sensitive is stored', 'The login and password are never written to our database, our logs, or any error message. The address is not stored either — only a keyed digest of it, so repeat checks of the same proxy can be recognised without keeping the proxy.'],
  ['Free, right here', 'Three checks an hour, no account. Need a whole pack at once, with no limit and a saved history? That’s the panel, included with any module.'],
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

function ProxyCheckerPage({ setPage }) {
  return (
    <div>
      <PageHero
        badge="FREE TOOL"
        title="Telegram proxy checker"
        sub="Check whether a proxy actually works with Telegram — and see the country and data centre Telegram reports through it, next to the real exit IP and the network behind it."
      />

      <PageSection>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 22 }}>
          <Pill dot>Free — 3 checks/hour, no account</Pill>
          <Pill muted>SOCKS5 · HTTP · MTProto</Pill>
        </div>

        {/* The working tool, first: a searcher who lands here can use it
            without reading a word below. */}
        <div style={{ marginBottom: 52 }}>
          <ProxyCheckerWidget />
        </div>

        {/* The batch, SECOND, and that ordering is deliberate. A searcher who
            landed on "telegram proxy checker" has one proxy in their
            clipboard and wants an answer without reading anything; the form
            above gives them that. The paste box is for the person who came
            back — they bought a pack, and now the question is whether the
            pack is consistent. Putting it first would meet the first visitor
            with an empty textarea and homework. */}
        <SectionLockup title="Bought a pack? Check three at once">
          Paste the lines your provider sent, in whatever format they sent
          them. Three count as one of your free checks, so comparing proxies
          from the same purchase does not cost you the whole allowance.
        </SectionLockup>
        <div style={{ marginTop: 22, marginBottom: 52 }}>
          <ProxyBatchWidget />
        </div>

        <SectionLockup title="What it tells you">
          A proxy being reachable and a proxy being usable for Telegram are two
          different questions. This answers the second one.
        </SectionLockup>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
          {READINGS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="panel ticks" style={{ padding: '28px 26px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ color: ACCENT }} aria-hidden="true"><Icon size={18} /></span>
              <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '1.25rem', color: 'white', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                {title}
              </span>
              <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.7 }}>
                {body}
              </span>
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
              <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.66rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: `rgba(${ACCENT_RGB},0.75)` }}>
                {term}
              </span>
              <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.94rem', color: 'rgba(255,255,255,0.62)', lineHeight: 1.75 }}>
                {detail}
              </span>
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

Object.assign(window, { ProxyCheckerPage });
