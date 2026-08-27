---
category: Controls
---

The DS button: `white` switches between the two brand button styles — solid cyan (`.btn-solid`, primary CTA with shine sweep on hover) and outlined glass (`.btn-outline`, secondary). Mono uppercase label styling comes from the classes.

```jsx
<GlassBtn white onClick={go}>Enter panel <ArrowUpRight size={15} /></GlassBtn>  // primary
<GlassBtn onClick={more}>See how it works <ArrowUpRight size={14} /></GlassBtn> // secondary
<GlassBtn white style={{ padding: '15px 32px', fontSize: '0.82rem' }}>See Pricing</GlassBtn>
```

Buttons habitually end with an `<ArrowUpRight size={13–15} />` icon. For links styled as buttons, use `<a className="btn-solid">` / `<a className="btn-outline">` directly.
