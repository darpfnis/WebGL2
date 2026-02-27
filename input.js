import { toNDC } from './webgl-utils.js';

export const MODES = { POINT: 'point', TRIANGLE: 'triangle', CIRCLE: 'circle' };

export class InputHandler {
  constructor(canvas, renderer, onStatus) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.onStatus = onStatus;
    this.mode = MODES.POINT;
    this.color = '#f4c2c2';
    this.canvas.addEventListener('click', (e) => this._onClick(e));
  }

  setMode(m) { this.mode = m; this.renderer.triPending = []; this.renderer.circPending = null; this.renderer.render(); this._updateStatus(); }
  setColor(c) { this.color = c; }

  _onClick(e) {
    const [x, y] = toNDC(this.canvas, e.clientX, e.clientY);
    if (this.mode === MODES.POINT) {
      this.renderer.pointIdx.push(this.renderer.addVertex(x, y, this.color));
    } else if (this.mode === MODES.TRIANGLE) {
      this.renderer.triPending.push(this.renderer.addVertex(x, y, this.color));
      if (this.renderer.triPending.length === 3) {
        this.renderer.triIdx.push(...this.renderer.triPending);
        this.renderer.triPending = [];
      }
    } else if (this.mode === MODES.CIRCLE) {
      this._handleCircle(x, y);
    }
    this.renderer.render();
    this._updateStatus();
  }

  _handleCircle(x, y) {
    const r = this.renderer;
    const aspect = this.canvas.width / this.canvas.height;
    if (!r.circPending) {
      r.circPending = { centerIdx: r.addVertex(x, y, this.color) };
      r.pointIdx.push(r.circPending.centerIdx);
    } else {
      const { centerIdx } = r.circPending;
      const cx = r.vertices[centerIdx].x, cy = r.vertices[centerIdx].y;
      const radius = Math.hypot((x - cx) * aspect, y - cy);
      r.pointIdx = r.pointIdx.filter(i => i !== centerIdx);
      const edgeIndices = [];
      for (let i = 0; i <= 64; i++) {
        const a = (i / 64) * 2 * Math.PI;
        edgeIndices.push(r.addVertex(cx + (Math.cos(a) * radius) / aspect, cy + Math.sin(a) * radius, this.color));
      }
      r.circleGroups.push({ centerIdx, edgeIndices });
      r.circPending = null;
    }
  }

  _updateStatus() {
    const counts = `${this.renderer.pointIdx.length} точок · ${this.renderer.triIdx.length/3|0} трик. · ${this.renderer.circleGroups.length} кіл`;
    this.onStatus(this.mode, counts);
  }
}