import * as React from 'react';
import { Wordmark } from 'atreox-ai';

// This DS lives on near-black — every cell carries the brand backdrop the
// site itself renders on (cards' own chrome is white, designs get var(--bg)).
const Frame = ({ children }: { children?: React.ReactNode }) => (
  <div style={{ background: 'var(--bg, #020403)', padding: '30px 26px', borderRadius: 6 }}>{children}</div>
);

// Navbar-size glowing logotype — the default everywhere the brand name appears.
export const Default = () => (
  <Frame><Wordmark /></Frame>
);

// The site footer's own variant: smaller, glow off.
export const Footer = () => (
  <Frame><Wordmark size="0.92rem" glow={false} /></Frame>
);

// Oversized display lockup, custom color.
export const Display = () => (
  <Frame><Wordmark size="2.2rem" color="#ffffff" /></Frame>
);
