---
category: Navigation
---

The site footer — Wordmark + tagline column, Navigation/Legal/Contact link columns in mono/Barlow, and a bottom rail with copyright and a pulsing status dot. Hairline cyan top border.

```jsx
<FooterBar setPage={(id) => route(id)} />
```

`setPage` receives `'home' | 'functions' | 'pricing' | 'privacy' | 'terms'`. The site wraps it in a padded container: `<div style={{ padding: '0 5% 60px' }}><FooterBar setPage={route} /></div>`.
