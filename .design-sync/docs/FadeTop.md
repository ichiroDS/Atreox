---
category: Effects
---

Absolute-positioned black-to-transparent gradient pinned to the TOP of its nearest positioned ancestor — softens a section's upper edge over imagery or the animated background. `h` is the gradient height in px (default 200).

```jsx
<section style={{ position: 'relative' }}>
  <FadeTop h={160} />
  {/* section content */}
</section>
```
