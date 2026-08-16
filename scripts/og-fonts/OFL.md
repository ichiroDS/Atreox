# Fonts used to draw the Open Graph cards

`scripts/prerender.mjs` rasterises one social card per guide. resvg needs
real font files — it cannot ask the OS on a build machine that has none —
so the three brand faces are checked in here rather than hoped for.

They are not loaded by the site itself; the browser gets these from Google
Fonts as it always has. Nothing but the OG card generator reads them.

- **Playfair Display** — variable, © Claus Eggers Sørensen
- **JetBrains Mono** — variable, © JetBrains
- **Marcellus** — © Brian J. Bonislawsky (Astigmatic)

All three are under the SIL Open Font License 1.1, which permits bundling
and redistribution: https://openfontlicense.org
