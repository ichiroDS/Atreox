---
category: Effects
---

Absolute-positioned transparent-to-black gradient pinned to the BOTTOM of its nearest positioned ancestor — the counterpart of `FadeTop` for a section's lower edge. `h` is the gradient height in px (default 200).

```jsx
<section style={{ position: 'relative' }}>
  {/* section content */}
  <FadeBottom h={160} />
</section>
```
