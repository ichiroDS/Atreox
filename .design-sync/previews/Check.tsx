import * as React from 'react';
import { Check } from 'atreox-ai';

const Frame = ({ children }: { children?: React.ReactNode }) => (
  <div style={{ background: 'var(--bg, #020403)', padding: 26, borderRadius: 6, color: '#fff' }}>{children}</div>
);

// Stroke icon at the sizes the site uses (13–32px), inheriting currentColor.
export const Sizes = () => (
  <Frame>
    <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
      <Check size={16} />
      <Check size={24} />
      <Check size={32} />
    </div>
  </Frame>
);

// Brand cyan and dimmed variants via the color prop.
export const Colors = () => (
  <Frame>
    <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
      <Check size={24} color="#00d9ff" />
      <Check size={24} color="rgba(255,255,255,0.45)" />
    </div>
  </Frame>
);
