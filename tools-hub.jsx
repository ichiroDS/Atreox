/* ══════════════════════════════════════════════════════════════════
   tools-hub.jsx — /tools.

   The choice between the two free checkers, for somebody who arrived
   from search on the word "tools" rather than on a specific one.

   WHY A HUB AT ALL. The two checkers already had their own pages and
   their own sitemap rows; what was missing was the address a person
   guesses. /tools was a 404, and every link that wanted to say "our
   free tools" had to pick one of them and hide the other.

   The framing is the buyer's, not ours. Somebody landing here is
   about to spend money on a batch of accounts, and the two tools
   answer the two halves of "will this purchase work": is the account
   real, and is the proxy the kind Telegram tolerates. So each card
   leads with the question it answers, not with the feature list.

   Head, canonical, OG image and the sitemap entry come from the
   SITE_PAGES table in scripts/prerender.mjs, like every other route.
══════════════════════════════════════════════════════════════════ */

const React = window.React;
const {
  ArrowUpRight, Server, Shield, Users, Zap,
  FooterBar, CrossLinks,
  PageHero, PageSection, SectionLockup, Pill, MONO, SERIF,
} = window;

const ACCENT = window.ACCENT;
const ACCENT_RGB = window.ACCENT_RGB;

/* The two tools, in the order a purchase actually happens: you check
   the account you were sent BEFORE you buy the batch, and you check
   the proxy you intend to run it on. Account first for that reason,
   not because it is the newer page. */
const TOOLS = [
  {
    page: 'account-checker',
    href: '/tools/account-checker',
    icon: Users,
    kicker: 'BEFORE YOU PAY',
    title: 'Account checker',
    question: 'Is this account what the seller says it is?',
    body:
      'Upload one account’s tdata from the batch you were sent. You get the facts ' +
      'Telegram reports: whether it can actually post, whether a spam limit is applied, ' +
      'the earliest date Telegram still has a session for, its home data centre and the ' +
      'device it was registered on.',
    points: [
      'Can it post — not just read. The two are different, and only one of them earns money.',
      'The earliest date Telegram can prove, next to the estimate — a seller’s “aged 30 days” is checkable.',
      'Observations, not a rating: every line shows what it was read from.',
    ],
  },
  {
    page: 'proxy-checker',
    href: '/tools/proxy-checker',
    icon: Server,
    kicker: 'BEFORE YOU RUN IT',
    title: 'Proxy checker',
    question: 'Will Telegram accept this proxy?',
    body:
      'Paste a SOCKS5, HTTP or MTProto proxy. You get the country and nearest data centre ' +
      'Telegram itself reports through it — not where the IP is registered — plus the real ' +
      'exit address, its network, and how long each stage took.',
    points: [
      'What TELEGRAM sees, which is the field an account’s geo is judged against.',
      'Which stage failed, and how slow it was — a working mobile proxy is slow, not dead.',
      'The exit IP and its network, from local databases; the address is never stored.',
    ],
  },
];

/* Why a free tool exists at all, said plainly rather than implied.
   A visitor who suspects a bait-and-switch stops reading; one who is
   told where the wall is, and why, tends not to mind it. */
const HONESTY = [
  {
    icon: Zap,
    title: 'Three checks an hour, free',
    body:
      'No account, no card. The limit is per tool, so the account checker and the proxy ' +
      'checker do not share an allowance.',
  },
  {
    icon: Shield,
    title: 'Nothing is kept',
    body:
      'An uploaded account is used for its one check and deleted immediately — never stored, ' +
      'never logged. A proxy’s address is never written down at all; only a keyed digest of it is.',
  },
];

function ToolsHubPage({ setPage }) {
  return (
    <div>
      <PageHero
        kicker="FREE TOOLS"
        title="Check it before you buy it"
        lede={
          'Two free checkers for the two things a batch of Telegram accounts can be wrong ' +
          'about: the accounts, and the proxies you plan to run them on. No account needed.'
        }
      />

      <PageSection>
        <SectionLockup
          eyebrow="// choose"
          title="What do you want to check?"
        />
        <div
          style={{
            display: 'grid',
            gap: 20,
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            marginTop: 28,
          }}
        >
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <a
                key={tool.page}
                href={tool.href}
                onClick={(e) => {
                  /* Left-click navigates in-app; ctrl/cmd-click and
                     middle-click keep the browser's own behaviour, which
                     an href-less div would have thrown away. */
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                  e.preventDefault();
                  setPage(tool.page);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  padding: '26px 24px',
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.10)',
                  background: 'rgba(255,255,255,0.02)',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon size={18} style={{ color: ACCENT }} />
                  <Pill>{tool.kicker}</Pill>
                </div>

                <h3
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 500,
                    fontSize: '1.6rem',
                    lineHeight: 1.15,
                    color: '#fff',
                    margin: 0,
                  }}
                >
                  {tool.title}
                </h3>

                {/* The question the tool answers, given the weight a
                    heading usually gets. It is what the visitor came
                    with; the product name is not. */}
                <p
                  style={{
                    margin: 0,
                    fontFamily: MONO,
                    fontSize: '0.82rem',
                    letterSpacing: '0.02em',
                    color: `rgba(${ACCENT_RGB},0.85)`,
                  }}
                >
                  {tool.question}
                </p>

                <p style={{ margin: 0, lineHeight: 1.6, color: 'rgba(255,255,255,0.72)' }}>
                  {tool.body}
                </p>

                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  {tool.points.map((point) => (
                    <li
                      key={point}
                      style={{
                        display: 'flex',
                        gap: 8,
                        fontSize: '0.92rem',
                        lineHeight: 1.55,
                        color: 'rgba(255,255,255,0.62)',
                      }}
                    >
                      <span aria-hidden style={{ color: ACCENT }}>—</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 'auto',
                    paddingTop: 6,
                    fontFamily: MONO,
                    fontSize: '0.78rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: ACCENT,
                  }}
                >
                  Open the checker <ArrowUpRight size={14} />
                </span>
              </a>
            );
          })}
        </div>
      </PageSection>

      <PageSection>
        <SectionLockup eyebrow="// the terms" title="What free means here" />
        <div
          style={{
            display: 'grid',
            gap: 18,
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            marginTop: 24,
          }}
        >
          {HONESTY.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} style={{ display: 'flex', gap: 12 }}>
                <Icon size={17} style={{ color: ACCENT, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ margin: '0 0 6px', color: '#fff', fontWeight: 500 }}>
                    {item.title}
                  </p>
                  <p style={{ margin: 0, lineHeight: 1.6, color: 'rgba(255,255,255,0.68)' }}>
                    {item.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </PageSection>

      {/* The reading half of the loop: a tool catches the search, an
          article explains what to do with the answer, and both lead to
          the panel. The blog links back to the tools the same way. */}
      <PageSection>
        <SectionLockup
          eyebrow="// read"
          title="Working out what the answer means"
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
          <a
            href="/blog/how-to-check-telegram-account-before-buying"
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
              e.preventDefault();
              setPage('blog');
              window.history.pushState({}, '', '/blog/how-to-check-telegram-account-before-buying');
            }}
            style={{ color: ACCENT, textDecoration: 'none', fontSize: '1rem' }}
          >
            How to check a Telegram account before buying →
          </a>
          <a
            href="/guides/buying-telegram-accounts"
            style={{ color: ACCENT, textDecoration: 'none', fontSize: '1rem' }}
          >
            The full buying guide: TData, GEO, rest time, testing a seller →
          </a>
          <a
            href="/guides/proxies-for-telegram-accounts"
            style={{ color: ACCENT, textDecoration: 'none', fontSize: '1rem' }}
          >
            Proxies for Telegram accounts: which type, and matching the GEO →
          </a>
        </div>
      </PageSection>

      {/* current="tools" is not one of CrossLinks' three destinations, so
          all three show - which is right on a hub whose visitor has not yet
          seen Functions, Guides or Pricing. */}
      <CrossLinks current="tools" setPage={setPage} />
      <FooterBar setPage={setPage} />
    </div>
  );
}

window.ToolsHubPage = ToolsHubPage;
