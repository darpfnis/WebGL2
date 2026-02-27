<<<<<<< HEAD
// ── input.js ──
import { toNDC } from './webgl-utils.js';

export const MODES = { POINT: 'point', TRIANGLE: 'triangle', CIRCLE: 'circle' };

export class InputHandler {
  constructor(canvas, renderer, onStatusUpdate) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.onStatus = onStatusUpdate;
    this.mode = MODES.POINT;
    this.color = '#f4c2c2';

    canvas.addEventListener('click', (e) => this._onClick(e));
  }

  setMode(mode) {
    this.mode = mode;
    this.renderer.triPending = [];
    this.renderer.circPending = null;
    this.renderer.render();
    this._updateStatus();
  }

  setColor(hex) { this.color = hex; }

  _onClick(e) {
    const [x, y] = toNDC(this.canvas, e.clientX, e.clientY);
    if (this.mode === MODES.POINT) this._handlePoint(x, y);
    else if (this.mode === MODES.TRIANGLE) this._handleTriangle(x, y);
    else if (this.mode === MODES.CIRCLE) this._handleCircle(x, y);
    this.renderer.render();
    this._updateStatus();
  }

  _handlePoint(x, y) {
    const idx = this.renderer.addVertex(x, y, this.color);
    this.renderer.pointIdx.push(idx);
  }

  _handleTriangle(x, y) {
    const idx = this.renderer.addVertex(x, y, this.color);
    this.renderer.triPending.push(idx);
    if (this.renderer.triPending.length === 3) {
      this.renderer.triIdx.push(...this.renderer.triPending);
      this.renderer.triPending = [];
    }
  }

  _handleCircle(x, y) {
    const r = this.renderer;
    const aspect = this.canvas.width / this.canvas.height;

    if (!r.circPending) {
      const centerIdx = r.addVertex(x, y, this.color);
      r.pointIdx.push(centerIdx);
      r.circPending = { centerIdx };
    } else {
      const { centerIdx } = r.circPending;
      const cx = r.vertices[centerIdx].x;
      const cy = r.vertices[centerIdx].y;
      
      const dx = (x - cx) * aspect;
      const dy = (y - cy);
      const radius = Math.hypot(dx, dy);

      r.pointIdx = r.pointIdx.filter(i => i !== centerIdx);

      const SEGMENTS = 64;
      const edgeIndices = [];
      for (let i = 0; i <= SEGMENTS; i++) {
        const angle = (i / SEGMENTS) * 2 * Math.PI;
        const ex = cx + (Math.cos(angle) * radius) / aspect;
        const ey = cy + (Math.sin(angle) * radius);
        edgeIndices.push(r.addVertex(ex, ey, this.color));
      }
      r.circleGroups.push({ centerIdx, edgeIndices });
      r.circPending = null;
    }
  }

  _updateStatus() {
    const r = this.renderer;
    const counts = `${r.pointIdx.length} точок · ${r.triIdx.length/3|0} трикутн. · ${r.circleGroups.length} кіл`;
    this.onStatus(this.mode, counts);
  }
}
=======
// ── input.js ──
// Handles all mouse events and wires them to the Renderer
// Uses getBoundingClientRect() to fix cursor offset (Завдання 1)

import { toNDC } from './webgl-utils.js';

export const MODES = { POINT: 'point', TRIANGLE: 'triangle', CIRCLE: 'circle' };

export class InputHandler {
  constructor(canvas, renderer, onStatusUpdate) {
    this.canvas    = canvas;
    this.renderer  = renderer;
    this.onStatus  = onStatusUpdate;

    this.mode      = MODES.POINT;
    this.color     = '#f4c2c2'; // default: pastel pink

    // Завдання 1 — click creates a point, offset fixed via getBoundingClientRect
    canvas.addEventListener('click', (e) => this._onClick(e));
  }

  setMode(mode) {
    this.mode = mode;
    // Reset in-progress primitives when switching modes
    this.renderer.triPending  = [];
    this.renderer.circPending = null;
    this.renderer.render();
    this._updateStatus();
  }

  setColor(hex) {
    this.color = hex;
  }

  _onClick(e) {
    // Fix cursor position using bounding rect (Завдання 1)
    const [x, y] = toNDC(this.canvas, e.clientX, e.clientY);

    if      (this.mode === MODES.POINT)    this._handlePoint(x, y);
    else if (this.mode === MODES.TRIANGLE) this._handleTriangle(x, y);
    else if (this.mode === MODES.CIRCLE)   this._handleCircle(x, y);

    this.renderer.render();
    this._updateStatus();
  }

  // ── Завдання 1: add a point ─────────────────────────────────────────────
  _handlePoint(x, y) {
    const idx = this.renderer.addVertex(x, y, this.color);
    this.renderer.pointIdx.push(idx);
  }

  // ── Завдання 3: 3-click triangle ────────────────────────────────────────
  _handleTriangle(x, y) {
    const idx = this.renderer.addVertex(x, y, this.color);

    this.renderer.triPending.push(idx);

    if (this.renderer.triPending.length === 3) {
      // Flush pending into triIdx
      this.renderer.triIdx.push(...this.renderer.triPending);
      this.renderer.triPending = [];
    }
  }

  // ── Завдання 4: 2-click circle ──────────────────────────────────────────
  // 1st click = center (temporarily added to pointIdx for visibility)
  // 2nd click = sets radius, builds TRIANGLE_FAN vertices
  _handleCircle(x, y) {
  const r = this.renderer;
  const aspect = this.canvas.width / this.canvas.height; 

  if (!r.circPending) {
    const centerIdx = r.addVertex(x, y, this.color);
    r.pointIdx.push(centerIdx);
    r.circPending = { centerIdx };
  } else {
    const { centerIdx } = r.circPending;
    const cx = r.vertices[centerIdx].x;
    const cy = r.vertices[centerIdx].y;

    const dx = (x - cx) * aspect; 
    const dy = y - cy;
    const radius = Math.hypot(dx, dy);

    r.pointIdx = r.pointIdx.filter(i => i !== centerIdx);

    const SEGMENTS = 60;
    const edgeIndices = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      const angle = (i / SEGMENTS) * 2 * Math.PI;
      
      const ex = cx + (Math.cos(angle) * radius) / aspect; 
      const ey = cy + (Math.sin(angle) * radius);
      
      edgeIndices.push(r.addVertex(ex, ey, this.color));
    }

    r.circleGroups.push({ centerIdx, edgeIndices });
    r.circPending = null;
  }
}

  _updateStatus() {
    const r = this.renderer;
    const pending = r.triPending.length > 0
      ? ` · ${r.triPending.length}/3 вершин`
      : r.circPending ? ' · клікни для радіуса' : '';

    const counts =
      `${r.pointIdx.length} точок · ` +
      `${r.triIdx.length / 3 | 0} трикутн. · ` +
      `${r.circleGroups.length} кіл`;

    this.onStatus(this.mode + pending, counts);
  }
}
>>>>>>> d7fc285260cc2a6fe4e2cfac29b658c61ca8b138
