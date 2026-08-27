import * as React from 'react';
import { Navbar } from 'atreox-ai';

// Navbar renders position:fixed at the viewport top — the preview gives it a
// tall dark stage so the fixed bar paints inside the card's own viewport.
export const Desktop = () => (
  <div style={{ background: 'var(--bg, #020403)', height: 150, position: 'relative' }}>
    <Navbar currentPage="home" setPage={() => {}} />
  </div>
);
