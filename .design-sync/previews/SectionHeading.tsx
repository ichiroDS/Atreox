import * as React from 'react';
import { SectionHeading, SectionBadge } from 'atreox-ai';

const Frame = ({ children }: { children?: React.ReactNode }) => (
  <div style={{ background: 'var(--bg, #020403)', padding: '32px 28px', borderRadius: 6 }}>{children}</div>
);

// A section title as it appears on the site.
export const Default = () => (
  <Frame>
    <SectionHeading>Why ATREOX is different</SectionHeading>
  </Frame>
);

// The full section-opener pattern: mono overline kicker + serif headline.
export const WithBadge = () => (
  <Frame>
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: 16 }}><SectionBadge>The difference</SectionBadge></div>
      <SectionHeading>Simple, transparent pricing.</SectionHeading>
    </div>
  </Frame>
);
