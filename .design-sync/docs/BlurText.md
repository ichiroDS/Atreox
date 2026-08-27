---
category: Typography
---

Word-by-word blur-in reveal for headlines: each word de-blurs and rises when the element scrolls into view. `glowWords` gives named words the breathing cyan glow (`.glow-word`).

```jsx
<BlurText
  text="AI-powered Telegram growth, on autopilot."
  glowWords={['Telegram']}
  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500,
           fontSize: 'clamp(2.7rem, 5.8vw, 4.4rem)', color: 'white', lineHeight: 1.08 }}
/>
```

`delay` (ms per word, default 120) staggers the reveal. Style carries the typography — BlurText itself only animates.
