# design-sync notes — atreox-site

- **Zero-build repo**: components are global-scope browser JSX (`shared.jsx`, loaded via Babel standalone in index.html). The sync consumes them through a committed staging layer: `.design-sync/ds-entry/index.jsx` (sets `window.React`, loads the FramerMotion shim, imports the real `shared.jsx`, re-exports its window globals) + `.design-sync/extract-html-assets.mjs` (`cfg.buildCmd` — regenerates `.design-sync/.cache/atreox.css` and `fm-shim.js` from index.html so it stays the single source of truth).
- **Converter invocation**: `--entry .design-sync/ds-entry/index.jsx --node-modules .ds-sync/node_modules`. React is installed in `.ds-sync` pinned to **18.3.1** to match the site's CDN `<script>` pin — if index.html bumps the React version, re-install to match.
- **No `.d.ts` anywhere**: the component list comes entirely from `componentSrcMap` (all 41 pinned to `shared.jsx`), props from hand-written `dtsPropsFor`, groups + prompt docs from `.design-sync/docs/<Name>.md` frontmatter (`docsDir`).
- **Dark-native DS**: the preview card chrome is white but every component is designed for near-black. Every authored preview wraps its cells in a `background: var(--bg, #020403)` frame — new previews must do the same or white text renders invisible.
- **Navbar** renders `position: fixed` → escapes grid cells; pinned to `overrides.Navbar = {cardMode: "single", primaryStory: "Desktop"}`. FooterBar is wide → `cardMode: "column"`.
- **BgColorSystem is deliberately excluded** (renders null; only pokes the site's canvas background via `window.__bgRefresh`).
- **Not statically renderable, skipped by design**: Navbar's mobile hamburger/menu (resize-driven), button hover states (shine sweep, tilt), TypeText mid-animation (previews use `speed={1} startDelay={0}` so text is fully typed at capture).
- **Windows gotcha**: if the shell's persistent cwd sits inside `ds-bundle/`, the converter's output reset fails with EPERM (`rm` of a process's cwd) — `cd` to repo root first.
- **Known render warns**: none outstanding — all 41 components authored and graded good (2026-07-12).

## Re-sync risks

- `extract-html-assets.mjs` finds the CSS and FramerMotion shim by regex over index.html (`<style>…</style>` first block; `<script>window.FramerMotion…</script>`). Restructuring index.html (splitting the style block, moving the shim) breaks extraction or silently grabs the wrong block — the extractor throws when it finds nothing, but a *split* style block would ship partial CSS silently. Check extractor output size (~10.5KB css / ~2.7KB shim) after index.html changes.
- `ds-entry/index.jsx` re-export list mirrors `shared.jsx`'s `Object.assign(window, …)`. A component added to shared.jsx does NOT appear in the sync until it's (1) exported in ds-entry, (2) added to `componentSrcMap` + `dtsPropsFor`, (3) given a `.design-sync/docs/<Name>.md`, and ideally (4) an authored preview.
- `dtsPropsFor` is hand-maintained — a prop change in shared.jsx silently stales the published `.d.ts` contract. Grep the changed component's props on every re-sync.
- Fonts are Google-Fonts-remote (`@import` in the shipped CSS, `[FONT_REMOTE]`) — captures and rendered designs need network; nothing ships in `fonts/`.
- Icon previews are template-generated copies (Sizes + Colors cells) — a new icon needs its own preview file (copy any existing icon preview).
- `tokens/` and `guidelines/` are empty in this DS — all tokens live inside `_ds_bundle.css` `:root`.
