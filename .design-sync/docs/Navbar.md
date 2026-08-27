---
category: Navigation
---

The site's fixed top navigation — LogoMark + Wordmark lockup left, mono uppercase nav links center, solid CTA right; frosted-glass background that solidifies on scroll, cyan scroll-progress hairline along the bottom edge. Collapses to a hamburger + full-screen serif menu under 768px.

```jsx
<Navbar currentPage="home" setPage={(id) => route(id)} />
```

`currentPage` is one of `'home' | 'functions' | 'pricing'` (the active link gets the cyan underline); `setPage` receives the clicked link's id. It renders `position: fixed` at the viewport top — give the page ~64px top padding.
