/* ══════════════════════════════════════════════════════════════════
   functions.jsx — everything ATREOX can do, on one screen or two.

   A scannable overview, not a sales essay: one card per module with a
   sentence or two on what it is for, a short list of what you can do
   with it in the panel, its price, and the guide that teaches it. Then
   the two free tools and the account pages. The words come from
   MODULES and TOOLS in catalog.jsx, so this page, Pricing and the
   guides cannot disagree about a price or an address.
══════════════════════════════════════════════════════════════════ */

const React = window.React;
const { useRef } = React;
const {
  motion, useInView,
  ArrowUpRight, Check, Zap, Award, Shield, Users,
  PageHero, PageSection, SectionLockup, CrossLinks, FooterBar,
  MONO, SERIF, MODULES, TOOLS, moduleGuideHref, guideFromPath, eur,
} = window;

const GREEN = window.ACCENT;
const GREEN_RGB = window.ACCENT_RGB;

/* A left click with no modifier is ours to handle in-app; anything else
   (middle click, ctrl/cmd, shift) is the browser's, and the href is a
   real address either way. */
const plainClick = e =>
  !e.defaultPrevented && e.button === 0 &&
  !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

const cardGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))',
  gap: 14,
};

const summaryStyle = {
  fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.93rem',
  color: 'rgba(255,255,255,0.72)', lineHeight: 1.6, margin: '0 0 14px',
};

const tagStyle = {
  fontFamily: MONO, fontWeight: 500, fontSize: '0.6rem', letterSpacing: '0.12em',
  textTransform: 'uppercase', whiteSpace: 'nowrap',
};

function Bullets({ items }) {
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
      {items.map(t => (
        <li key={t} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
          <Check size={13} color={GREEN} style={{ marginTop: 4, flexShrink: 0 }} />
          <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.87rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.55 }}>{t}</span>
        </li>
      ))}
    </ul>
  );
}

/* The card's way out: a quiet link along its foot. */
function CardLink({ href, onClick, children }) {
  return (
    <a href={href} onClick={onClick} className="quiet-link" style={{ marginTop: 'auto', paddingTop: 16 }}>
      {children} <ArrowUpRight size={12} />
    </a>
  );
}

function CardHead({ icon: Icon, name, tag, tagTone }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
      <span aria-hidden="true" style={{
        width: 32, height: 32, borderRadius: 5, flexShrink: 0,
        background: `rgba(${GREEN_RGB},0.08)`, border: `1px solid rgba(${GREEN_RGB},0.24)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={15} color={GREEN} />
      </span>
      <h3 style={{ flex: 1, minWidth: 0, fontFamily: SERIF, fontWeight: 500, fontSize: '1.25rem', color: 'white', lineHeight: 1.2, letterSpacing: '-0.01em', margin: 0 }}>
        {name}
      </h3>
      {tag && <span style={{ ...tagStyle, color: tagTone || 'rgba(255,255,255,0.45)' }}>{tag}</span>}
    </div>
  );
}

function Card({ id, children, index, inView }) {
  return (
    <motion.div id={id}
      initial={{ opacity: 0, y: 14 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.04 }}
      className="panel ticks"
      style={{ padding: '20px 22px 18px', display: 'flex', flexDirection: 'column', scrollMarginTop: 96 }}>
      {children}
    </motion.div>
  );
}

function ModuleCard({ mod, index, inView, setPage }) {
  const href = moduleGuideHref(mod);
  const guide = href && guideFromPath(href.replace(/#.*$/, ''));
  const openGuide = e => {
    if (!guide || !plainClick(e)) return;
    /* A module taught as a section of another guide (Profile Templates)
       keeps its #section: a full navigation is what lands on it. */
    if (href.includes('#')) return;
    e.preventDefault();
    setPage('guides', 'guide-' + guide.slug);
  };
  return (
    <Card id={'fn-' + mod.key} index={index} inView={inView}>
      <CardHead icon={mod.icon} name={mod.name}
        tag={mod.included ? 'Included' : `${eur(mod.price)} / mo`}
        tagTone={mod.included ? undefined : GREEN} />
      <p style={summaryStyle}>{mod.summary}</p>
      <Bullets items={mod.can} />
      {href && <CardLink href={href} onClick={openGuide}>{guide && href.includes('#') ? `Guide: ${guide.navTitle || guide.title}` : 'Guide'}</CardLink>}
    </Card>
  );
}

function Grid({ children }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.02 });
  return (
    <div ref={ref} style={cardGrid}>
      {children(inView)}
    </div>
  );
}

/* Hero, section ledes and the non-module rows at module scope so
   scripts/prerender.mjs can read them: they are the page's H1 and its
   body, and a crawler has to find them in the HTML rather than after
   React mounts. */
const HERO = {
  badge: 'Functions',
  title: 'Everything ATREOX does',
  sub: 'Eight modules and two free tools, each in a few lines. Account Manager and Profile Templates come with any purchase; every other module is priced on its own.',
};

const MODULES_LEDE =
  'In the same order as the sidebar in the panel. Prices are per month.';

const TOOL_ICONS = { 'proxy-checker': Shield, 'account-checker': Users };
const TOOL_CAN = [
  'Free on this site, no login needed',
  'In the panel: batch checks and a history of past checks',
];

const TOOLS_LEDE = 'Check a proxy or an account before you pay for a batch.';

const EXTRAS = [
  {
    key: 'billing', name: 'Billing', icon: Zap, href: '/pricing', page: 'pricing', link: 'Pricing',
    summary: 'Add or remove modules, update your card, see invoices and cancel, all from the Billing page in the panel.',
  },
  {
    key: 'referral', name: 'Referral program', icon: Award, href: '/referral-program', page: 'referral', link: 'How it works',
    summary: 'Share your link from Settings and earn 25% recurring commission for as long as a customer you referred stays subscribed.',
  },
];

const CLOSE = {
  title: 'Take the ones you need',
  body: 'Modules are billed one by one, so you only pay for what you run.',
};

function FunctionsPage({ setPage }) {
  return (
    <div>
      <PageHero {...HERO} />

      <PageSection style={{ paddingTop: 56, paddingBottom: 24 }}>
        <SectionLockup title="Modules" style={{ marginBottom: 22 }}>{MODULES_LEDE}</SectionLockup>
        <Grid>
          {inView => MODULES.map((m, i) => (
            <ModuleCard key={m.key} mod={m} index={i} inView={inView} setPage={setPage} />
          ))}
        </Grid>
      </PageSection>

      <PageSection style={{ paddingTop: 40, paddingBottom: 24 }}>
        <SectionLockup title="Free tools" style={{ marginBottom: 22 }}>{TOOLS_LEDE}</SectionLockup>
        <Grid>
          {inView => TOOLS.map((t, i) => (
            <Card key={t.id} id={'fn-' + t.id} index={i} inView={inView}>
              <CardHead icon={TOOL_ICONS[t.id] || Shield} name={t.name} tag="Free" />
              <p style={summaryStyle}>{t.blurb}</p>
              <Bullets items={TOOL_CAN} />
              <CardLink href={t.page}>{t.cta}</CardLink>
            </Card>
          ))}
        </Grid>
      </PageSection>

      <PageSection style={{ paddingTop: 40, paddingBottom: 56 }}>
        <SectionLockup title="Your account" style={{ marginBottom: 22 }} />
        <Grid>
          {inView => EXTRAS.map((x, i) => (
            <Card key={x.key} id={'fn-' + x.key} index={i} inView={inView}>
              <CardHead icon={x.icon} name={x.name} />
              <p style={{ ...summaryStyle, margin: 0 }}>{x.summary}</p>
              <CardLink href={x.href}
                onClick={e => { if (plainClick(e)) { e.preventDefault(); setPage(x.page); } }}>
                {x.link}
              </CardLink>
            </Card>
          ))}
        </Grid>
      </PageSection>

      {/* ── close ── */}
      <PageSection style={{ paddingTop: 24 }}>
        <div className="panel ticks" style={{ padding: 'clamp(32px, 5vw, 52px)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(1.5rem, 2.8vw, 2rem)', color: 'white', marginBottom: 10, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
            {CLOSE.title}
          </h2>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', maxWidth: 480, margin: '0 auto 24px', lineHeight: 1.6 }}>
            {CLOSE.body}
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-solid" onClick={() => setPage('pricing')} style={{ padding: '14px 28px', fontSize: '0.8rem' }}>
              Build your licence <ArrowUpRight size={15} />
            </button>
            <button className="btn-outline" onClick={() => setPage('guides')} style={{ padding: '13px 24px' }}>
              See the guides <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </PageSection>

      <CrossLinks current="functions" setPage={setPage} />

      <div style={{ padding: '0 5% 64px' }}><FooterBar setPage={setPage} /></div>
    </div>
  );
}

Object.assign(window, { FunctionsPage });

/* ── The same words, as data, for scripts/prerender.mjs ─────────── */
(window.PAGE_COPY || (window.PAGE_COPY = {}))['/functions'] = {
  kicker: HERO.badge,
  h1: HERO.title,
  lead: HERO.sub,
  sections: [
    ...MODULES.map((m) => ({
      id: 'fn-' + m.key,
      title: m.name,
      blocks: [
        ['p', (m.included ? 'Included with any purchase. ' : `${eur(m.price)} per month. `) + m.summary],
        ['bullets', m.can],
        ...(moduleGuideHref(m) ? [['linkout', { href: moduleGuideHref(m), label: 'Guide: ' + m.name }]] : []),
      ],
    })),
    ...TOOLS.map((t) => ({
      id: 'fn-' + t.id,
      title: t.name,
      blocks: [
        ['p', t.blurb],
        ['bullets', TOOL_CAN],
        ['linkout', { href: t.page, label: t.cta }],
      ],
    })),
    {
      title: 'Your account',
      blocks: EXTRAS.flatMap((x) => [
        ['p', x.summary],
        ['linkout', { href: x.href, label: x.name }],
      ]),
    },
    {
      title: CLOSE.title,
      blocks: [
        ['p', CLOSE.body],
        ['linkout', { href: '/pricing', label: 'Build your licence' }],
        ['linkout', { href: '/guides', label: 'See the guides' }],
      ],
    },
  ],
};
