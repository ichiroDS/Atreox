import * as React from 'react';
import { BlurText } from 'atreox-ai';

// This DS lives on near-black — every cell carries the brand backdrop the
// site itself renders on (cards' own chrome is white, designs get var(--bg)).
const Frame = ({ children }: { children?: React.ReactNode }) => (
  <div style={{ background: 'var(--bg, #020403)', padding: '32px 28px', borderRadius: 6 }}>{children}</div>
);

// The hero headline treatment: serif display type, one glowing brand word.
// delay is kept tiny so the reveal settles before the preview is captured.
export const HeroHeadline = () => (
  <Frame>
    <div style={{ maxWidth: 640 }}>
      <BlurText
        text="AI-powered Telegram growth, on autopilot."
        glowWords={['Telegram']}
        delay={10}
        style={{
          fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500,
          fontSize: '2.6rem', color: 'white', lineHeight: 1.1, letterSpacing: '-0.015em',
        }}
      />
    </div>
  </Frame>
);

// Body-scale reveal without glow words.
export const Subheadline = () => (
  <Frame>
    <div style={{ maxWidth: 520 }}>
      <BlurText
        text="Two plans. No contracts. Cancel anytime from the dashboard."
        delay={10}
        style={{
          fontFamily: 'Barlow, sans-serif', fontWeight: 300,
          fontSize: '1.05rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.65,
        }}
      />
    </div>
  </Frame>
);
