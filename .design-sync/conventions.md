# ATREOX "terminal luxe" conventions

**Dark-native system — no provider needed.** `styles.css` sets `html { background: var(--bg) }` (near-black `#020403`); every component is designed for that backdrop. Never place components on white — white body text and glow effects vanish. Your own containers should use `var(--bg)` or the panel treatment below. Fonts load automatically via the Google Fonts `@import` in the stylesheet.

**Styling idiom: brand CSS classes + tokens + inline styles.** The shipped stylesheet defines the whole visual language — use its classes for anything it covers, inline styles with tokens for your own layout glue. The vocabulary (all in `_ds_bundle.css`, reachable from `styles.css`):

| Class | What it is |
|---|---|
| `panel` | the surface: near-black gradient card, hairline cyan border, 6px radius |
| `panel-hover` | adds lift + cyan glow on hover (combine: `"panel panel-hover"`) |
| `ticks` | blueprint corner register-marks on a panel (featured/important cards) |
| `btn-solid` | primary CTA — solid cyan, mono uppercase, shine sweep on hover |
| `btn-outline` | secondary — outlined glass button |
| `overline` | `// SECTION` mono kicker, cyan, 0.24em tracking (SectionBadge renders this) |
| `nav-link` (+ `active`) | mono uppercase nav item; active gets cyan underline |
| `cursor` | blinking terminal block cursor (inline `<span>`) |
| `glow-word` | breathing cyan glow for one accent word in a headline |
| `cta-breathe` / `featured-pulse` | breathing halo for hero CTA / featured card |
| `section-block` | standard 88px vertical section rhythm |

**Tokens** (defined on `:root`): `--g` (accent `#00d9ff`), `--g-bright`, `--g-ink` (text-on-accent), alpha steps `--g-06 --g-10 --g-14 --g-22 --g-40`, `--bg`, `--panel`, and font stacks `--serif` (Playfair Display — display headlines), `--logotype` (Marcellus — wordmark only), `--sans` (Barlow 300 — body), `--mono` (JetBrains Mono — labels/buttons/data, always uppercase + letterspaced). JS constants: `window.AtreoxDS.ACCENT` (`'#00d9ff'`) and `ACCENT_RGB` (`'0,217,255'`, for `rgba(${ACCENT_RGB},0.14)` borders). Hairline borders are `1px solid rgba(0,217,255,0.10–0.22)`.

**Motion utilities** on `window.AtreoxDS`: `motion.div/p/span/h1/h2/section/button` (props: `initial`, `animate`, `transition {duration, delay}`, `whileHover`), `useInView(ref, {once, amount})`, `AnimatePresence`, and `tiltHandlers(maxDeg)` (spread onto a card for cursor-follow 3D tilt).

**Read before styling:** `styles.css` → `_ds_bundle.css` (every class + token above, verbatim), and each component's `.prompt.md` for its usage pattern.

**Idiomatic section** (composition from the site itself):

```jsx
const { SectionBadge, SectionHeading, GlassBtn, ArrowUpRight } = window.AtreoxDS;

<section className="section-block" style={{ padding: '88px 5%', maxWidth: 1280, margin: '0 auto' }}>
  <div style={{ textAlign: 'center', marginBottom: 60 }}>
    <div style={{ marginBottom: 16 }}><SectionBadge>Capabilities</SectionBadge></div>
    <SectionHeading>What ATREOX does</SectionHeading>
  </div>
  <div className="panel panel-hover ticks" style={{ padding: '30px 26px' }}>
    <h4 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.95rem', color: 'white', marginBottom: 10 }}>Contextual AI comments</h4>
    <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
      Every comment matches the channel's tone.
    </p>
  </div>
  <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 36 }}>
    <GlassBtn white>See Pricing <ArrowUpRight size={15} /></GlassBtn>
    <GlassBtn>Explore Functions <ArrowUpRight size={14} /></GlassBtn>
  </div>
</section>
```
