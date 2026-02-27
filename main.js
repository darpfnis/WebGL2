<<<<<<< HEAD
// ── main.js ──

import { Renderer }    from './renderer.js';
import { InputHandler } from './input.js';
import { initUI }       from './ui.js';

window.onload = function () {
  const renderer = new Renderer('main-canvas');

  // Status bar update callback
  const statusMode   = document.getElementById('status-mode');
  const statusCounts = document.getElementById('status-counts');

  function onStatus(mode, counts) {
    statusMode.textContent   = mode;
    statusCounts.textContent = counts;
  }

  const canvas  = document.getElementById('main-canvas');
  const handler = new InputHandler(canvas, renderer, onStatus);

  initUI(handler, renderer);

  // Initial render (empty dark canvas)
  renderer.render();
  onStatus('point', '0 точок · 0 трикутн. · 0 кіл');
=======
// ── main.js ──

import { Renderer }    from './renderer.js';
import { InputHandler } from './input.js';
import { initUI }       from './ui.js';

window.onload = function () {
  const renderer = new Renderer('main-canvas');

  // Status bar update callback
  const statusMode   = document.getElementById('status-mode');
  const statusCounts = document.getElementById('status-counts');

  function onStatus(mode, counts) {
    statusMode.textContent   = mode;
    statusCounts.textContent = counts;
  }

  const canvas  = document.getElementById('main-canvas');
  const handler = new InputHandler(canvas, renderer, onStatus);

  initUI(handler, renderer);

  // Initial render (empty dark canvas)
  renderer.render();
  onStatus('point', '0 точок · 0 трикутн. · 0 кіл');
>>>>>>> d7fc285260cc2a6fe4e2cfac29b658c61ca8b138
};