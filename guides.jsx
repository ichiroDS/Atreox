
/* ══════════════════════════════════════════════════════════════════
   guides.jsx — the page that teaches.

   Most of these videos don't exist yet, and the page is built around
   that being the normal state rather than an error state. A guide with
   no `video` in catalog.jsx renders as a complete card that says so —
   title, summary, and what it will cover — with no clickable affordance
   pretending to be a link. Drop a URL into the catalog entry and the
   same card becomes a real one. Nothing here needs editing when a guide
   gets recorded.
══════════════════════════════════════════════════════════════════ */

const React = window.React;
const { useRef } = React;
const {
  motion, useInView,
  ArrowUpRight, Check, Clock, Play, BookOpen,
  PageHero, PageSection, SectionLockup, Pill, CrossLinks, FooterBar,
  MONO, SERIF, GUIDES, GUIDES_READY, MODULE_BY_KEY,
} = window;

const GREEN = window.ACCENT;
const GREEN_RGB = window.ACCENT_RGB;
const CONTACT = 'hello@atreoxai.com';

/* ─── Publication counter: honest, and it moves on its own as videos
   land, because it counts the catalog rather than a hardcoded number. ─── */
function PublishedMeter() {
  const total = GUIDES.length;
  const pct = Math.round((GUIDES_READY / total) * 100);
  return (
    <div className="panel" style={{ padding: '22px 26px', display: 'flex', gap: 22, alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 260px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, marginBottom: 12 }}>
          <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '1.8rem', color: GUIDES_READY ? GREEN : 'rgba(255,255,255,0.35)', lineHeight: 1 }}>
            {GUIDES_READY}
          </span>
          <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.66rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
            of {total} recorded
          </span>
        </div>
        <div aria-hidden="true" style={{ height: 3, background: `rgba(${GREEN_RGB},0.1)`, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            width: pct + '%', height: '100%',
            background: `linear-gradient(90deg, rgba(${GREEN_RGB},0.8), var(--g-bright))`,
            boxShadow: `0 0 12px rgba(${GREEN_RGB},0.5)`,
            transition: 'width 0.6s ease',
          }} />
        </div>
      </div>
      <p style={{ flex: '1 1 300px', fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.87rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
        We're filming these one at a time. Every guide is listed below with what it will cover, whether
        it exists yet or not — {' '}
        <a href={`mailto:${CONTACT}?subject=Guide%20request`} style={{ color: GREEN, textDecoration: 'none' }}>
          tell us which one you need first
        </a> and it moves up the list.
      </p>
    </div>
  );
}

/* ─── One guide.
   Two states, one layout. The card body is never itself a link — the
   actions live in the footer, so an unrecorded guide simply has no
   "watch" action rather than a link that goes nowhere. A recorded one
   gets the hover lift and the corner ticks; an unrecorded one stays
   dashed and quiet, and the difference is legible before the click. ─── */
function GuideCard({ guide, index, inView, setPage }) {
  const ready = Boolean(guide.video);
  const mod = guide.module ? MODULE_BY_KEY[guide.module] : null;
  const Icon = mod ? mod.icon : BookOpen;

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: Math.min(index, 6) * 0.06 }}
      id={'guide-' + guide.slug}
      className={'panel' + (ready ? ' panel-hover ticks' : '')}
      style={{
        padding: '26px 26px 24px', scrollMarginTop: 88,
        display: 'flex', flexDirection: 'column',
        borderColor: ready ? undefined : 'rgba(255,255,255,0.08)',
        borderStyle: ready ? 'solid' : 'dashed',
        background: ready ? undefined : 'rgba(255,255,255,0.012)',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <span aria-hidden="true" style={{
          width: 36, height: 36, borderRadius: 4, flexShrink: 0,
          background: ready ? `rgba(${GREEN_RGB},0.08)` : 'rgba(255,255,255,0.035)',
          border: `1px solid ${ready ? `rgba(${GREEN_RGB},0.26)` : 'rgba(255,255,255,0.1)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={ready ? GREEN : 'rgba(255,255,255,0.35)'} />
        </span>
        <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.6rem', letterSpacing: '0.16em', color: ready ? `rgba(${GREEN_RGB},0.4)` : 'rgba(255,255,255,0.2)' }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <span style={{ marginLeft: 'auto' }}>
          {ready
            ? <Pill dot>Watch</Pill>
            : <Pill muted>Not filmed yet</Pill>}
        </span>
      </div>

      <h3 style={{
        fontFamily: SERIF, fontWeight: 500, fontSize: '1.3rem',
        color: ready ? 'white' : 'rgba(255,255,255,0.72)',
        letterSpacing: '-0.01em', lineHeight: 1.22, marginBottom: 11,
      }}>
        {guide.title}
      </h3>

      <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.86rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 20 }}>
        {guide.summary}
      </p>

      {/* what it covers — the part that has to be useful even with no video */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {guide.covers.map((c, i) => (
          <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
            <Check size={13} color={ready ? GREEN : 'rgba(255,255,255,0.28)'} style={{ marginTop: 3, flexShrink: 0 }} />
            <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{c}</span>
          </div>
        ))}
      </div>

      {/* footer: the actions. An unfilmed guide gets no "watch" action at
          all — just the status, and the module doc that stands in for it. */}
      <div style={{
        marginTop: 'auto', paddingTop: 16,
        borderTop: `1px solid ${ready ? `rgba(${GREEN_RGB},0.14)` : 'rgba(255,255,255,0.07)'}`,
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between',
      }}>
        {ready ? (
          <a href={guide.video} target="_blank" rel="noopener noreferrer" className="quiet-link">
            <Play size={11} /> Watch the guide <ArrowUpRight size={12} />
          </a>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: MONO, fontWeight: 500, fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.34)' }}>
            <Clock size={11} color="rgba(255,255,255,0.34)" /> Coming soon
          </span>
        )}

        {mod && (
          <button type="button" className="quiet-link quiet-link-dim"
            onClick={() => setPage('functions', 'fn-' + mod.key)}>
            What it does <ArrowUpRight size={11} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ─── a titled run of cards ─── */
function GuideGroup({ title, blurb, guides, offset, setPage }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.03 });
  return (
    <>
      <SectionLockup title={title}>{blurb}</SectionLockup>
      <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 18 }}>
        {guides.map((g, i) => (
          <GuideCard key={g.slug} guide={g} index={offset + i} inView={inView} setPage={setPage} />
        ))}
      </div>
    </>
  );
}

function GuidesPage({ setPage }) {
  const setup   = GUIDES.filter(g => g.group === 'setup');
  const modules = GUIDES.filter(g => g.group === 'module');

  return (
    <div>
      <PageHero
        badge="Guides"
        title="Learn it once, then run it."
        sub="Every guide ATREOX will ship, listed with what it covers — including the ones still being recorded. Nothing here is a dead link: if a video isn't filmed yet, the card says so."
      />

      <PageSection style={{ paddingBottom: 34 }}>
        <PublishedMeter />
      </PageSection>

      <PageSection style={{ paddingTop: 0, paddingBottom: 40 }}>
        <GuideGroup
          title="Before you start"
          blurb="The two things you buy elsewhere and bring with you. Get these wrong and no module setting will save the batch."
          guides={setup} offset={0} setPage={setPage} />
      </PageSection>

      <PageSection style={{ paddingTop: 0 }}>
        <GuideGroup
          title="Module guides"
          blurb="One per module, in the order the pipeline runs them. Each walks the panel end to end — what to fill in, what to leave alone, and what the numbers mean once it's running."
          guides={modules} offset={setup.length} setPage={setPage} />
      </PageSection>

      {/* ── what to do while a guide is missing ── */}
      <PageSection style={{ paddingTop: 0 }}>
        <div className="panel ticks" style={{ padding: 'clamp(36px, 6vw, 64px) clamp(24px, 5%, 72px)', display: 'flex', gap: 36, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 320px', minWidth: 0 }}>
            <span className="overline" style={{ display: 'block', marginBottom: 16 }}>{'// '}In the meantime</span>
            <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(1.6rem, 3.1vw, 2.2rem)', color: 'white', lineHeight: 1.14, letterSpacing: '-0.01em', marginBottom: 14 }}>
              A missing video isn't a missing answer
            </h2>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.93rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, maxWidth: 540 }}>
              Every module's page on Functions lists what it does and every setting it exposes — enough
              to configure it without a walkthrough. If you get stuck on a module whose guide isn't up
              yet, write to us and we'll walk you through it directly.
            </p>
          </div>
          {/* no flexShrink:0 here — at 375px the pair has to be allowed to
              shrink and wrap, or it sets the page's scroll width */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn-solid" onClick={() => setPage('functions')} style={{ padding: '15px 28px', fontSize: '0.78rem' }}>
              Read the module docs <ArrowUpRight size={14} />
            </button>
            <a href={`mailto:${CONTACT}?subject=Setup%20help`} className="btn-outline" style={{ padding: '14px 24px' }}>
              Ask us directly <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
      </PageSection>

      <CrossLinks current="guides" setPage={setPage} />

      <div style={{ padding: '0 5% 64px' }}><FooterBar setPage={setPage} /></div>
    </div>
  );
}

Object.assign(window, { GuidesPage });
