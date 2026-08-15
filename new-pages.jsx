
/* ══════════════════════════════════════════════════════════════════
   new-pages.jsx — the Pricing page (the page that closes).

   The module list, the prices and the licence maths all come from
   catalog.jsx — the same table Functions and Guides read — so a price
   change lands on all three pages at once.
══════════════════════════════════════════════════════════════════ */

const React = window.React;
const { useRef, useState, useEffect } = React;
const {
  motion, useInView,
  ArrowUpRight, Check, BookOpen, Layers,
  FooterBar, CrossLinks,
  PageHero, PageSection, SectionLockup, Pill, MONO, SERIF,
  MODULES, PRICED_MODULES, MODULE_BY_KEY, INCLUDED_MODULES,
  FULL_MONTHLY, FULL_YEARLY, YEARLY_SAVING, eur,
} = window;

const DASHBOARD_URL = 'https://app.atreoxai.com';
const GREEN = window.ACCENT;
const GREEN_RGB = window.ACCENT_RGB;

// Mirrors atreox-dashboard's isActiveStatus() (lib/stripe/subscription-store.ts)
// so "active" means the same thing on both sides of the deep link.
const CLERK_ACTIVE_STATUSES = new Set(['active', 'trialing']);

// The Clerk script tag in index.html is `defer`, and this file is itself a
// Babel-transpiled <script type="text/babel"> — neither load order relative
// to the other is guaranteed, so poll for window.Clerk rather than assume
// it's already there.
function waitForClerk(timeoutMs = 8000) {
  return new Promise((resolve) => {
    if (window.Clerk) return resolve(window.Clerk);
    const start = Date.now();
    const iv = setInterval(() => {
      if (window.Clerk) { clearInterval(iv); resolve(window.Clerk); }
      else if (Date.now() - start > timeoutMs) { clearInterval(iv); resolve(null); }
    }, 50);
  });
}

// Resolves to the visitor's real plan state once Clerk hydrates. `loading`
// stays true (buttons render their signed-out default) until then, so there's
// one transition at most instead of a flash between guesses.
function useSubscriptionState() {
  const [state, setState] = useState({ loading: true, tier: null, active: false });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const clerk = await waitForClerk();
        if (!clerk) { if (!cancelled) setState({ loading: false, tier: null, active: false }); return; }
        await clerk.load();
        if (cancelled) return;
        const meta = clerk.user?.publicMetadata || {};
        setState({
          loading: false,
          tier: meta.subscriptionTier ?? null,
          active: CLERK_ACTIVE_STATUSES.has(meta.subscriptionStatus),
        });
      } catch (_) {
        if (!cancelled) setState({ loading: false, tier: null, active: false });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return state;
}

// Checkout for the modular plans isn't wired yet — every CTA lands on the
// dashboard's billing screen and the chosen plan gets passed in a later pass.
// Until then the only thing the Clerk state changes is the wording: an existing
// subscriber is managing a licence, not buying one.
const BILLING_URL = `${DASHBOARD_URL}/billing`;

function billingCTA(sub, label) {
  const href = window.withReferral(BILLING_URL);
  if (!sub.loading && sub.active) return { label: 'Manage in panel', href };
  return { label, href };
}

/* ─── one selectable module ─── */
function ModuleCard({ mod, selected, onToggle }) {
  const Icon = mod.icon;
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={'panel panel-hover' + (selected ? ' ticks' : '')}
      style={{
        padding: '26px 26px 28px', textAlign: 'left', width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', gap: 18,
        borderColor: selected ? `rgba(${GREEN_RGB},0.45)` : undefined,
        // backgroundColor, not the shorthand — the shorthand would drop .panel's gradient layer
        backgroundColor: selected ? `rgba(${GREEN_RGB},0.05)` : undefined,
        transition: 'border-color 0.16s ease, background-color 0.16s ease, box-shadow 0.18s ease, transform 0.18s cubic-bezier(0.2,0.9,0.3,1)',
      }}>
      {/* icon · name · checkbox — the dashboard's module-tile anatomy */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <span aria-hidden="true" style={{
          width: 34, height: 34, borderRadius: 4, flexShrink: 0,
          background: `rgba(${GREEN_RGB},0.08)`, border: `1px solid rgba(${GREEN_RGB},${selected ? 0.4 : 0.22})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color 0.16s ease',
        }}>
          <Icon size={16} color={GREEN} />
        </span>
        <span style={{
          flex: 1, minWidth: 0, fontFamily: MONO, fontWeight: 500, fontSize: '0.72rem',
          letterSpacing: '0.14em', textTransform: 'uppercase', color: 'white', lineHeight: 1.3,
        }}>
          {mod.name}
        </span>
        <span aria-hidden="true" style={{
          width: 20, height: 20, borderRadius: 3, flexShrink: 0,
          border: `1px solid rgba(${GREEN_RGB},${selected ? 1 : 0.3})`,
          background: selected ? GREEN : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background-color 0.16s ease, border-color 0.16s ease',
        }}>
          {selected && <Check size={13} color="#00141c" style={{ strokeWidth: 3 }} />}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
        <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '2.1rem', color: GREEN, lineHeight: 1 }}>{eur(mod.price)}</span>
        <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>/ month</span>
      </div>

      <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.87rem', color: 'rgba(255,255,255,0.52)', lineHeight: 1.7, marginTop: 'auto' }}>
        {mod.desc}
      </p>
    </button>
  );
}

/* ─── monthly / annual segmented control, scoped to the licence card ─── */
function TermToggle({ term, setTerm }) {
  const opt = (value, label) => {
    const on = term === value;
    return (
      <button
        key={value} type="button" role="radio" aria-checked={on}
        onClick={() => setTerm(value)}
        style={{
          flex: 1, padding: '9px 10px', border: 'none', borderRadius: 2,
          background: on ? GREEN : 'transparent',
          color: on ? '#00141c' : 'rgba(255,255,255,0.55)',
          fontFamily: MONO, fontWeight: on ? 600 : 500, fontSize: '0.6rem',
          letterSpacing: '0.16em', textTransform: 'uppercase',
          transition: 'background-color 0.16s ease, color 0.16s ease',
        }}>
        {label}
      </button>
    );
  };
  return (
    <div role="radiogroup" aria-label="Billing term" style={{
      display: 'flex', gap: 3, padding: 3, borderRadius: 4,
      border: `1px solid rgba(${GREEN_RGB},0.2)`, background: 'rgba(0,0,0,0.3)',
    }}>
      {opt('monthly', 'Monthly')}
      {opt('annual', 'Annual')}
    </div>
  );
}

/* ─── the licence, priced against the running total directly above it ─── */
function LicenceCard({ term, setTerm, sub }) {
  const annual = term === 'annual';
  const cta = billingCTA(sub, 'Get the full licence');
  return (
    <div className="panel ticks featured-pulse" style={{ padding: '24px 26px', borderColor: `rgba(${GREEN_RGB},0.45)` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
        <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.64rem', color: `rgba(${GREEN_RGB},0.75)`, letterSpacing: '0.24em', textTransform: 'uppercase' }}>{'// '}Full licence</span>
        <Pill dot>All {PRICED_MODULES.length}</Pill>
      </div>

      <TermToggle term={term} setTerm={setTerm} />

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 18 }}>
        <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '2.9rem', color: GREEN, lineHeight: 1, textShadow: `0 0 30px rgba(${GREEN_RGB},0.32)` }}>
          {eur(annual ? FULL_YEARLY : FULL_MONTHLY)}
        </span>
        <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
          / {annual ? 'year' : 'month'}
        </span>
      </div>

      {/* the saving is a number in both states — it's the reason to switch */}
      <p style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.68rem', letterSpacing: '0.06em', color: `rgba(${GREEN_RGB},0.8)`, marginTop: 10, lineHeight: 1.5 }}>
        {annual
          ? `${eur(YEARLY_SAVING)} less than 12 × ${eur(FULL_MONTHLY)}`
          : `Pay yearly: ${eur(FULL_YEARLY)} — saves ${eur(YEARLY_SAVING)}`}
      </p>

      {/* two lines, not three — "Account Manager included" is already said in
          the hero and again below; repeating it here is what makes a card read
          as filled rather than composed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 18, borderTop: `1px solid rgba(${GREEN_RGB},0.12)`, paddingTop: 16 }}>
        {[
          `All ${PRICED_MODULES.length} modules, including both parsers`,
          'Any module released while your licence is active, at no extra cost',
        ].map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <Check size={14} color={GREEN} style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.68)', lineHeight: 1.5 }}>{f}</span>
          </div>
        ))}
      </div>

      <a href={cta.href} target="_self" className="btn-solid"
        style={{ width: '100%', justifyContent: 'center', padding: '15px', fontSize: '0.78rem', marginTop: 20 }}>
        {cta.label} <ArrowUpRight size={15} />
      </a>
    </div>
  );
}

/* ─── running total, stacked straight above the licence price ─── */
function SelectionPanel({ keys, total, onClear, sub }) {
  const n = keys.length;
  const gap = FULL_MONTHLY - total;
  const cta = billingCTA(sub, `Continue · ${eur(total)}/mo`);

  return (
    <div className="panel" style={{ padding: '22px 26px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.64rem', color: `rgba(${GREEN_RGB},0.75)`, letterSpacing: '0.24em', textTransform: 'uppercase' }}>{'// '}Your selection</span>
        {n > 0 && (
          <button type="button" onClick={onClear} style={{
            background: 'none', border: 'none', padding: 0,
            fontFamily: MONO, fontWeight: 400, fontSize: '0.6rem', letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
          }}>Clear</button>
        )}
      </div>

      {/* count rides the total's baseline rather than taking a line of its own —
          the rail has to stay short enough to sit beside the licence on one screen */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '2.9rem', color: total ? GREEN : 'rgba(255,255,255,0.28)', lineHeight: 1, textShadow: total ? `0 0 28px rgba(${GREEN_RGB},0.28)` : 'none', transition: 'color 0.2s ease' }}>
          {eur(total)}
        </span>
        <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>/ month</span>
        <span style={{ marginLeft: 'auto', fontFamily: MONO, fontWeight: 400, fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
          {n === 0 ? 'none selected' : `${n} of ${PRICED_MODULES.length}`}
        </span>
      </div>

      {/* the comparison, said out loud the moment it starts to matter */}
      {total > 0 && gap > 0 && gap <= 40 && (
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.84rem', color: `rgba(${GREEN_RGB},0.85)`, lineHeight: 1.55, marginTop: 12 }}>
          {eur(gap)} more buys all {PRICED_MODULES.length}, below.
        </p>
      )}
      {total > 0 && gap <= 0 && (
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.84rem', color: `rgba(${GREEN_RGB},0.85)`, lineHeight: 1.55, marginTop: 12 }}>
          The full licence costs less than this — and includes every module.
        </p>
      )}

      {total === 0 ? (
        <button type="button" disabled className="btn-outline"
          style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '0.76rem', marginTop: 16, opacity: 0.4, cursor: 'not-allowed' }}>
          Select modules
        </button>
      ) : (
        <a href={cta.href} target="_self" className="btn-outline"
          style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '0.76rem', marginTop: 16 }}>
          {cta.label} <ArrowUpRight size={14} />
        </a>
      )}
    </div>
  );
}

/* ─── the two exits from the picker: what a module is, and how to run it ─── */
function ModuleHelpRail({ setPage }) {
  return (
    <div style={{
      marginTop: 20, padding: '16px 20px', borderRadius: 5,
      border: `1px solid rgba(${GREEN_RGB},0.12)`, background: `rgba(${GREEN_RGB},0.025)`,
      display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
    }}>
      <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.87rem', color: 'rgba(255,255,255,0.5)', flex: '1 1 260px', lineHeight: 1.6 }}>
        Not sure what one of these actually does, or how much work it is to set up?
      </span>
      <button type="button" className="quiet-link" onClick={() => setPage('functions')}>
        <Layers size={12} /> Read the module docs <ArrowUpRight size={12} />
      </button>
      <button type="button" className="quiet-link quiet-link-dim" onClick={() => setPage('guides')}>
        <BookOpen size={12} /> See the setup guides <ArrowUpRight size={12} />
      </button>
    </div>
  );
}

/* ─── What the price list is, before the price list.

   This used to be a paragraph at the bottom of the page, under the
   picker, in the same weight as everything else — which is where a fact
   goes to not be read. "Two of the eight are free with any purchase" is
   the single most load-bearing thing on this page: it changes what the
   cheapest possible order actually gets you, so it runs first and at
   headline size. ─── */
function CatalogueBanner({ setPage }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const counts = [
    { n: MODULES.length, label: 'modules', tone: 'plain' },
    { n: PRICED_MODULES.length, label: 'you pick and pay for', tone: 'plain' },
    { n: INCLUDED_MODULES.length, label: 'free with any purchase', tone: 'accent' },
  ];
  return (
    <PageSection style={{ paddingTop: 0, paddingBottom: 0 }}>
      {/* ref goes on a plain element — the FramerMotion shim's components
          don't forward refs (see index.html) */}
      <div ref={ref}>
      <motion.div className="panel ticks"
        initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        style={{ padding: 'clamp(30px, 4.5vw, 46px) clamp(26px, 4vw, 44px)' }}>

        <div style={{ display: 'flex', gap: 'clamp(24px, 5vw, 60px)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* the three numbers, largest thing on the page */}
          <div style={{ display: 'flex', gap: 'clamp(22px, 4vw, 46px)', flexWrap: 'wrap', flex: '0 1 auto' }}>
            {counts.map(({ n, label, tone }) => (
              <div key={label} style={{ minWidth: 96 }}>
                <div style={{
                  fontFamily: SERIF, fontWeight: 500, lineHeight: 1,
                  fontSize: 'clamp(2.6rem, 6vw, 4rem)',
                  color: tone === 'accent' ? GREEN : 'white',
                  textShadow: tone === 'accent' ? `0 0 32px rgba(${GREEN_RGB},0.3)` : 'none',
                }}>{n}</div>
                <div style={{
                  marginTop: 10, maxWidth: 150,
                  fontFamily: MONO, fontWeight: 400, fontSize: '0.63rem',
                  letterSpacing: '0.14em', textTransform: 'uppercase', lineHeight: 1.6,
                  color: tone === 'accent' ? `rgba(${GREEN_RGB},0.85)` : 'rgba(255,255,255,0.4)',
                }}>{label}</div>
              </div>
            ))}
          </div>

          {/* which two, by name, clickable — "free" is worth nothing until
              you know what you're getting */}
          <div style={{ flex: '1 1 300px', minWidth: 260 }}>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
              <strong style={{ fontWeight: 600, color: 'white' }}>
                {INCLUDED_MODULES.map(m => m.name).join(' and ')}
              </strong>{' '}
              are included with every order, down to a single module. They're how accounts get
              into the system and how they get a face — so they're never sold separately, and
              never charged for.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 18 }}>
              {INCLUDED_MODULES.map(m => (
                <button key={m.key} type="button" className="quiet-link"
                  onClick={() => setPage('functions', 'fn-' + m.key)}>
                  What {m.name} does <ArrowUpRight size={11} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
      </div>
    </PageSection>
  );
}

function PricingPage({ setPage }) {
  const gridRef = useRef(null);
  const gridIn = useInView(gridRef, { once: true, amount: 0.05 });
  const sub = useSubscriptionState();

  const [picked, setPicked] = useState([]);
  const [term, setTerm] = useState('monthly');
  const toggle = (key) => setPicked(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key]);
  const total = picked.reduce((sum, k) => sum + MODULE_BY_KEY[k].price, 0);

  return (
    <div>
      <PageHero
        badge="Pricing"
        title="Pay for what you run."
        sub="ATREOX is modular. Take the modules you need, or take the whole licence — two of the eight are free either way."
      />

      <CatalogueBanner setPage={setPage} />

      {/* One block: the modules on the left, what they add up to and what
          everything costs on the right. The two prices sit in the same rail so
          the comparison never needs a scroll. */}
      <PageSection>
        <SectionLockup title="Build your licence">
          The six you pay for, in the order they appear in the panel. Select what you need — the total
          updates as you go, and the full licence sits beside it for comparison.
        </SectionLockup>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 520px', minWidth: 0 }}>
            <div ref={gridRef} style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 16, alignContent: 'start',
            }}>
              {PRICED_MODULES.map((m, i) => (
                <motion.div key={m.key}
                  initial={{ opacity: 0, y: 8 }} animate={gridIn ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.55, delay: i * 0.06 }}
                  style={{ display: 'flex' }}>
                  <ModuleCard mod={m} selected={picked.includes(m.key)} onToggle={() => toggle(m.key)} />
                </motion.div>
              ))}
            </div>
            <ModuleHelpRail setPage={setPage} />
          </div>

          {/* Sticky as a direct flex child: its containing block is then the row,
              which is as tall as the module grid, so the rail has room to travel. */}
          <div style={{
            flex: '1 1 330px', maxWidth: 400, alignSelf: 'flex-start',
            position: 'sticky', top: 80,
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <SelectionPanel keys={picked} total={total} onClear={() => setPicked([])} sub={sub} />

            <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ flex: 1, height: 1, background: `rgba(${GREEN_RGB},0.14)` }} />
              <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: '0.58rem', letterSpacing: '0.24em', color: 'rgba(255,255,255,0.3)' }}>OR</span>
              <span style={{ flex: 1, height: 1, background: `rgba(${GREEN_RGB},0.14)` }} />
            </div>

            <LicenceCard term={term} setTerm={setTerm} sub={sub} />
          </div>
        </div>
      </PageSection>

      {/* ── the two things people ask about the price list ── */}
      <PageSection style={{ paddingTop: 0 }}>
        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'stretch' }}>
          <div className="panel" style={{ flex: '1 1 380px', padding: '34px 32px' }}>
            <span className="overline" style={{ display: 'block', marginBottom: 16 }}>{'// '}Why prices differ</span>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.75 }}>
              A module's price tracks how much computing it needs. Neurocommenting polls hundreds of channels
              continuously and generates a comment for every post that appears; NeuroDialogs holds a live
              connection open for each account and writes full replies. Active Warmup works to a schedule,
              Mass Reactions runs in short bursts, and the parsers do heavy but brief searches — which is why
              they sit at the bottom of the list.
            </p>
          </div>

          {/* "Included with everything" used to live here and now opens the
              page instead. What's left is the billing mechanics, which is
              genuinely a footnote. */}
          <div className="panel" style={{ flex: '1 1 380px', padding: '34px 32px' }}>
            <span className="overline" style={{ display: 'block', marginBottom: 16 }}>{'// '}How billing works</span>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.75, marginBottom: 16 }}>
              Every module is its own monthly line item. Add one and it starts; drop one and the rest
              keep running. Cancel from the panel and you keep access to the end of the period.
            </p>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.75 }}>
              Only the full licence is also sold by the year, at {eur(FULL_YEARLY)} — and it covers any
              module released while it's active, at no extra cost.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 44 }}>
          <p style={{ fontFamily: MONO, fontWeight: 400, fontSize: '0.7rem', letterSpacing: '0.04em', color: 'rgba(255,255,255,0.38)' }}>
            Running something bigger, or need a module that isn't here? <a href="mailto:hello@atreoxai.com" style={{ color: GREEN, textDecoration: 'none' }}>Get in touch</a>.
          </p>
        </div>
      </PageSection>

      <CrossLinks current="pricing" setPage={setPage} />

      <div style={{ padding: '0 5% 64px' }}><FooterBar setPage={setPage} /></div>
    </div>
  );
}

Object.assign(window, { PricingPage });
