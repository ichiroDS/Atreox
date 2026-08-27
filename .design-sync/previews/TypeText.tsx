import * as React from 'react';
import { TypeText } from 'atreox-ai';

const Frame = ({ children }: { children?: React.ReactNode }) => (
  <div style={{ background: 'var(--bg, #020403)', padding: '30px 26px', borderRadius: 6 }}>{children}</div>
);

// The hero's terminal overline: typed text + blinking block cursor.
// speed/startDelay kept tiny so the line is fully typed when captured.
export const TerminalOverline = () => (
  <Frame>
    <span className="overline">
      {'// '}
      <TypeText text="Neuro-commenting for Telegram" speed={1} startDelay={0} />
      <span className="cursor" />
    </span>
  </Frame>
);

// Standalone mono line, typed.
export const MonoLine = () => (
  <Frame>
    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
      <TypeText text="> engine listening..." speed={1} startDelay={0} />
    </span>
  </Frame>
);
