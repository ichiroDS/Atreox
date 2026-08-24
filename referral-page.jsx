
/* ══════════════════════════════════════════════════════════════════
   referral-page.jsx — /referral-program, one page, no reader.

   Small enough that it doesn't need the guide-body block engine in
   catalog.jsx/guides.jsx: the copy lives right here, and the same is
   true of its matching plain-HTML twin, renderReferral() in
   scripts/prerender.mjs — the same split the guides use, just written
   by hand instead of run through a generic renderer, because there is
   only ever going to be one of these.

   It reuses the guide body's own classes (.g-p, .g-callout, .g-fig,
   .g-note — defined once in index.html) rather than inventing a
   second visual language for "a page with some prose and a screen on
   it", which is what this is.
══════════════════════════════════════════════════════════════════ */

const React = window.React;
const { useState } = React;
const { PageHero, PageSection, Pill, CrossLinks, FooterBar, MONO, SERIF, ArrowUpRight } = window;

const ACCENT = window.ACCENT;
const ACCENT_RGB = window.ACCENT_RGB;
const DASHBOARD_URL = 'https://app.atreoxai.com';

function ReferralStep({ n, children, last }) {
  return (
    <div style={{ display: 'flex', gap: 16, paddingBottom: last ? 0 : 18 }}>
      <span aria-hidden="true" style={{
        width: 28, height: 28, borderRadius: 3, flexShrink: 0,
        border: `1px solid rgba(${ACCENT_RGB},0.34)`, background: `rgba(${ACCENT_RGB},0.07)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: MONO, fontWeight: 600, fontSize: '0.62rem', color: ACCENT, lineHeight: 1,
      }}>{n}</span>
      <p className="g-p" style={{ margin: 0, paddingTop: 4 }}>{children}</p>
    </div>
  );
}

/* Same guard as GuideFigure in guides.jsx — a <picture>'s <source>
   doesn't retry the plain <img src> on its own if it fails to load, so
   state (not a one-off DOM patch) is what drops it. Normally never
   fires; scripts/optimize-images.mjs writes the .webp sibling at
   build time. */
function ReferralFigure() {
  const [webpFailed, setWebpFailed] = useState(false);
  return (
    <figure className="g-fig" style={{ marginBottom: 32 }}>
      <picture>
        {!webpFailed && <source srcSet="/public/screenshots/reffereal-programme/ref.webp" type="image/webp" />}
        <img src="/public/screenshots/reffereal-programme/ref.png" alt="ATREOX Settings page showing the referral link, referral stats, and commission rate"
          width={1400} height={723} loading="lazy" decoding="async" onError={() => setWebpFailed(true)} />
      </picture>
      <figcaption>Refer a customer, in Settings — the link, and everyone who's used it</figcaption>
    </figure>
  );
}

function ReferralPage({ setPage }) {
  return (
    <div>
      <PageHero
        badge="Referral program"
        title="Send them the link. Get paid while they stay."
        sub="Open to content creators and regular users alike — anyone with a link to share."
      />

      <PageSection style={{ paddingBottom: 40 }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <Pill dot>How it works</Pill>
          <div style={{ marginTop: 22, marginBottom: 32 }}>
            <ReferralStep n="1">
              Open <b>Settings</b> inside the ATREOX dashboard.
            </ReferralStep>
            <ReferralStep n="2">
              Copy your referral link from the <b>Refer a customer</b> card.
            </ReferralStep>
            <ReferralStep n="3" last>
              Everyone who buys through it shows up in your panel — referred total, who's currently paying, and what that's worth this month.
            </ReferralStep>
          </div>

          <ReferralFigure />

          <div className="g-callout" style={{ maxWidth: 'none', textAlign: 'center', padding: '30px 26px' }}>
            <span style={{ display: 'block', fontFamily: SERIF, fontWeight: 500, fontSize: '2.6rem', color: ACCENT, lineHeight: 1, textShadow: `0 0 26px rgba(${ACCENT_RGB},0.3)`, marginBottom: 10 }}>
              25%
            </span>
            <p className="g-p" style={{ margin: '0 auto', maxWidth: 520, textAlign: 'center' }}>
              You earn <b>25% recurring commission</b> for as long as a customer you referred stays subscribed.
            </p>
          </div>

          <p className="g-note">
            The number in your panel is re-calculated from current subscriptions — it's an estimate, not an invoice. The actual payout is based on invoices that have actually been paid.
          </p>
        </div>
      </PageSection>

      <PageSection style={{ paddingTop: 0 }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <a href={window.withReferral(DASHBOARD_URL)} target="_self" className="btn-solid" style={{ display: 'inline-flex' }}>
            Open Settings <ArrowUpRight size={14} />
          </a>
        </div>
      </PageSection>

      <CrossLinks current="referral" setPage={setPage} />
      <div style={{ padding: '0 5% 64px' }}><FooterBar setPage={setPage} /></div>
    </div>
  );
}

Object.assign(window, { ReferralPage });
