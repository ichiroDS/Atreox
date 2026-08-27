import * as React from 'react';
import { FadeTop } from 'atreox-ai';

// The gradient needs something visible beneath it — a cyan grid stands in
// for the site's animated constellation background.
export const OverPattern = () => (
  <div style={{
    position: 'relative', height: 220, borderRadius: 6, overflow: 'hidden',
    background: 'repeating-linear-gradient(45deg, rgba(0,217,255,0.18) 0 12px, #020403 12px 34px)',
  }}>
    <FadeTop h={140} />
    <p style={{
      position: 'absolute', bottom: 18, left: 22,
      fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem',
      letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)',
    }}>
      content fades in from black above
    </p>
  </div>
);
