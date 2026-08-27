// The repo's JSX files are zero-build browser scripts that read React from
// window (index.html loads it from a CDN <script>). This module recreates
// that environment for the bundled build: it must be the FIRST import of the
// entry so window.React exists before shared.jsx executes.
import React from 'react';
import ReactDOM from 'react-dom';

window.React = React;
window.ReactDOM = ReactDOM;
