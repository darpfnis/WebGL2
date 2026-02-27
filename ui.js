// ── ui.js ──
// Wires DOM buttons / swatches to InputHandler + Renderer

import { MODES } from './input.js';

export function initUI(handler, renderer) {

  // ── Mode buttons 
  const btnPoint    = document.getElementById('btn-point');
  const btnTriangle = document.getElementById('btn-triangle');
  const btnCircle   = document.getElementById('btn-circle');
  const btnClear    = document.getElementById('btn-clear');

  const modeBtns = [btnPoint, btnTriangle, btnCircle];

  function setActiveMode(btn, mode) {
    modeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    handler.setMode(mode);
    // Update canvas cursor class
    const canvas = document.getElementById('main-canvas');
    canvas.className = `mode-${mode}`;
  }

  btnPoint   .addEventListener('click', () => setActiveMode(btnPoint,    MODES.POINT));
  btnTriangle.addEventListener('click', () => setActiveMode(btnTriangle, MODES.TRIANGLE));
  btnCircle  .addEventListener('click', () => setActiveMode(btnCircle,   MODES.CIRCLE));

  // ── Завдання 2: Clear button 
  btnClear.addEventListener('click', () => {
    renderer.clear();
    // Also reset mode visually
    setActiveMode(btnPoint, MODES.POINT);
  });

  // ── Завдання 2: Color swatches
  const swatches = document.querySelectorAll('.swatch');
  swatches.forEach(sw => {
    sw.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
      handler.setColor(sw.dataset.color);
    });
  });

  // Set first swatch as default active
  swatches[0]?.classList.add('active');

  // Set point mode as default active
  btnPoint.classList.add('active');
}
// ── ui.js ──
// Wires DOM buttons / swatches to InputHandler + Renderer

import { MODES } from './input.js';

export function initUI(handler, renderer) {

  // ── Mode buttons ─────────────────────────────────────────────────────────
  const btnPoint    = document.getElementById('btn-point');
  const btnTriangle = document.getElementById('btn-triangle');
  const btnCircle   = document.getElementById('btn-circle');
  const btnClear    = document.getElementById('btn-clear');

  const modeBtns = [btnPoint, btnTriangle, btnCircle];

  function setActiveMode(btn, mode) {
    modeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    handler.setMode(mode);
    // Update canvas cursor class
    const canvas = document.getElementById('main-canvas');
    canvas.className = `mode-${mode}`;
  }

  btnPoint   .addEventListener('click', () => setActiveMode(btnPoint,    MODES.POINT));
  btnTriangle.addEventListener('click', () => setActiveMode(btnTriangle, MODES.TRIANGLE));
  btnCircle  .addEventListener('click', () => setActiveMode(btnCircle,   MODES.CIRCLE));

  // ── Завдання 2: Clear button ─────────────────────────────────────────────
  btnClear.addEventListener('click', () => {
    renderer.clear();
    // Also reset mode visually
    setActiveMode(btnPoint, MODES.POINT);
  });

  // ── Завдання 2: Color swatches ───────────────────────────────────────────
  const swatches = document.querySelectorAll('.swatch');
  swatches.forEach(sw => {
    sw.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
      handler.setColor(sw.dataset.color);
    });
  });

  // Set first swatch as default active
  swatches[0]?.classList.add('active');

  // Set point mode as default active
  btnPoint.classList.add('active');
}