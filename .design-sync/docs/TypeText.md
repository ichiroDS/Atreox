---
category: Typography
---

Terminal typewriter reveal — types `text` character by character after `startDelay`. Used in the hero's mono overline; pair with the `.cursor` class (a blinking block) for the full terminal feel.

```jsx
<span className="overline">
  {'// '}<TypeText text="Neuro-commenting for Telegram" startDelay={1200} />
  <span className="cursor" />
</span>
```

`speed` is ms per character (default 32). Respects reduced-motion (renders instantly).
