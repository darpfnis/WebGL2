import { MODES } from './input.js';

export function initUI(handler, renderer) {
  const setupBtn = (id, mode) => {
    document.getElementById(id).addEventListener('click', (e) => {
      document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      handler.setMode(mode);
    });
  };

  setupBtn('btn-point', MODES.POINT);
  setupBtn('btn-triangle', MODES.TRIANGLE);
  setupBtn('btn-circle', MODES.CIRCLE);

  document.getElementById('btn-clear').addEventListener('click', () => renderer.clear());

  document.querySelectorAll('.swatch').forEach(s => {
    s.addEventListener('click', () => {
      document.querySelectorAll('.swatch').forEach(sw => sw.classList.remove('active'));
      s.classList.add('active');
      handler.setColor(s.dataset.color);
    });
  });
}