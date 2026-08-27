import * as React from 'react';
import { FooterBar } from 'atreox-ai';

// The site wraps the footer in a padded container on the black backdrop.
export const Default = () => (
  <div style={{ background: 'var(--bg, #020403)', padding: '0 5% 40px' }}>
    <FooterBar setPage={() => {}} />
  </div>
);
