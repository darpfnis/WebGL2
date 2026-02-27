import { MODES } from './input.js';

export function initUI(handler, renderer) {
  const btnPoint    = document.getElementById('btn-point');
  const btnTriangle = document.getElementById('btn-triangle');
  const btnCircle   = document.getElementById('btn-circle');
  const btnClear    = document.getElementById('btn-clear');

  const modeBtns = [btnPoint, btnTriangle, btnCircle];

  function setActiveUI(activeBtn, mode) {
    modeBtns.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
    handler.setMode(mode);
  }

  btnPoint.addEventListener('click', () => setActiveUI(btnPoint, MODES.POINT));
  btnTriangle.addEventListener('click', () => setActiveUI(btnTriangle, MODES.TRIANGLE));
  btnCircle.addEventListener('click', () => setActiveUI(btnCircle, MODES.CIRCLE));

  btnClear.addEventListener('click', () => {
    renderer.clear();
    setActiveUI(btnPoint, MODES.POINT);
  });

  const swatches = document.querySelectorAll('.swatch');
  swatches.forEach(sw => {
    sw.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
      handler.setColor(sw.dataset.color);
    });
  });
}