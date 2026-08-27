---
category: Brand
---

The ATREOX logotype — upright Marcellus caps in brand cyan with wide 0.32em tracking and an optional phosphor glow. Use it wherever the brand name appears: navbar lockups, footers, splash screens.

```jsx
<Wordmark />                                  // navbar-size, glowing
<Wordmark size="0.92rem" glow={false} />      // footer variant (site's own usage)
<Wordmark size="2rem" color="#ffffff" />      // oversized, white
```

Pair with `LogoMark` for the full lockup (mark left of the wordmark, ~10px gap, vertically centered).
