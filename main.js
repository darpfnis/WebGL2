import { Renderer } from './renderer.js';
import { InputHandler } from './input.js';
import { initUI } from './ui.js';

window.onload = () => {
  const renderer = new Renderer('main-canvas');
  const handler = new InputHandler(
    document.getElementById('main-canvas'),
    renderer,
    (mode, counts) => {
      document.getElementById('status-mode').textContent = mode;
      document.getElementById('status-counts').textContent = counts;
    }
  );
  initUI(handler, renderer);
  renderer.render();
};