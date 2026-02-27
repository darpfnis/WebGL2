// ui.js
import { MODES } from './input.js';

export function initUI(handler, renderer) {
  const modeBtns = {
    [MODES.POINT]: document.getElementById('btn-point'),
    [MODES.TRIANGLE]: document.getElementById('btn-triangle'),
    [MODES.CIRCLE]: document.getElementById('btn-circle')
  };
  const btnClear = document.getElementById('btn-clear');

  function setActiveMode(mode) {
    Object.values(modeBtns).forEach(btn => btn.classList.remove('active'));
    modeBtns[mode].classList.add('active');
    handler.setMode(mode);
  }

  Object.entries(modeBtns).forEach(([mode, btn]) => {
    btn.addEventListener('click', () => setActiveMode(mode));
  });

  btnClear.addEventListener('click', () => {
    renderer.clear();
    setActiveMode(MODES.POINT);
  });

  const swatches = document.querySelectorAll('.swatch');
  swatches.forEach(sw => {
    sw.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
      const newColor = sw.getAttribute('data-color');
      handler.setColor(newColor);
    });
  });
}