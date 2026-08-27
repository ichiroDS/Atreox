import * as React from 'react';
import { GlassBtn, ArrowUpRight } from 'atreox-ai';

// This DS lives on near-black — every cell carries the brand backdrop the
// site itself renders on (cards' own chrome is white, designs get var(--bg)).
const Frame = ({ children }: { children?: React.ReactNode }) => (
  <div style={{ background: 'var(--bg, #020403)', padding: 26, borderRadius: 6 }}>{children}</div>
);

// Primary CTA — solid cyan with the trailing arrow the site always uses.
export const Primary = () => (
  <Frame>
    <GlassBtn white>Enter panel <ArrowUpRight size={15} /></GlassBtn>
  </Frame>
);

// Secondary — outlined glass.
export const Secondary = () => (
  <Frame>
    <GlassBtn>See how it works <ArrowUpRight size={14} /></GlassBtn>
  </Frame>
);

// The hero's actual pairing: primary + secondary side by side.
export const Pair = () => (
  <Frame>
    <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
      <GlassBtn white style={{ padding: '15px 28px', fontSize: '0.8rem' }}>
        See Pricing <ArrowUpRight size={15} />
      </GlassBtn>
      <GlassBtn style={{ padding: '14px 24px' }}>
        Explore Functions <ArrowUpRight size={14} />
      </GlassBtn>
    </div>
  </Frame>
);
