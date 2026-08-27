import * as React from 'react';
import { LogoMark, Wordmark } from 'atreox-ai';

const Frame = ({ children }: { children?: React.ReactNode }) => (
  <div style={{ background: 'var(--bg, #020403)', padding: '30px 26px', borderRadius: 6 }}>{children}</div>
);

// The mark at its common sizes.
export const Sizes = () => (
  <Frame>
    <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
      <LogoMark height={22} />
      <LogoMark height={40} />
      <LogoMark height={64} />
    </div>
  </Frame>
);

// The navbar lockup — exactly how the site pairs mark and wordmark.
export const Lockup = () => (
  <Frame>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <LogoMark height={22} />
      <Wordmark />
    </div>
  </Frame>
);
