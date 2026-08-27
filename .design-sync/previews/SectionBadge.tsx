import * as React from 'react';
import { SectionBadge } from 'atreox-ai';

const Frame = ({ children }: { children?: React.ReactNode }) => (
  <div style={{ background: 'var(--bg, #020403)', padding: '30px 26px', borderRadius: 6 }}>{children}</div>
);

// The overline kicker — always reads as // LABEL in cyan mono caps.
export const Default = () => (
  <Frame>
    <SectionBadge>Pricing</SectionBadge>
  </Frame>
);

// Several sections' kickers, as used across the site.
export const Examples = () => (
  <Frame>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <SectionBadge>Capabilities</SectionBadge>
      <SectionBadge>Who it's for</SectionBadge>
      <SectionBadge>FAQ</SectionBadge>
    </div>
  </Frame>
);
