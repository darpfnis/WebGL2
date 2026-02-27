<<<<<<< HEAD
// ── renderer.js ──
import { setupWebGL, createProgram } from './webgl-utils.js';

const VS_SRC = `
  attribute vec2 aPosition;
  void main() {
    gl_Position  = vec4(aPosition, 0.0, 1.0);
    gl_PointSize = 8.0;
  }
`;

const FS_SRC = `
  precision mediump float;
  uniform vec3 uColor;
  void main() {
    if (gl_PointSize > 1.0 && length(gl_PointCoord - vec2(0.5)) > 0.5) discard;
    gl_FragColor = vec4(uColor, 1.0);
  }
`;

export class Renderer {
  constructor(canvasId) {
    this.gl      = setupWebGL(canvasId);
    this.canvas  = document.getElementById(canvasId);
    this.prog    = createProgram(this.gl, VS_SRC, FS_SRC);

    const gl     = this.gl;
    gl.useProgram(this.prog);

    this.uColor  = gl.getUniformLocation(this.prog, 'uColor');
    this.aPos    = gl.getAttribLocation(this.prog,  'aPosition');

    this.vbo     = gl.createBuffer();
    this.vertices = []; 
    this.pointIdx    = [];  
    this.triIdx      = [];  
    this.circleGroups = []; 
    this.triPending   = [];   
    this.circPending  = null; 
  }

  addVertex(x, y, color) {
    const idx = this.vertices.length;
    this.vertices.push({ x, y, ...colorToRGB(color) });
    return idx;
  }

  _upload() {
    const gl   = this.gl;
    const data = new Float32Array(this.vertices.flatMap(v => [v.x, v.y]));
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.aPos);
    gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);
  }

  render() {
    const gl = this.gl;
    gl.clearColor(0.165, 0.153, 0.145, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (this.vertices.length === 0) return;
    this._upload();

    // Малюємо точки індивідуально для збереження кольору
    for (const idx of this.pointIdx) {
      this._drawIndexed([idx], gl.POINTS);
    }

    // Малюємо трикутники по 3 вершини для збереження кольору
    for (let i = 0; i < this.triIdx.length; i += 3) {
      this._drawIndexed(this.triIdx.slice(i, i + 3), gl.TRIANGLES);
    }

    // Малюємо кола
    for (const circle of this.circleGroups) {
      const indices = [circle.centerIdx, ...circle.edgeIndices];
      this._drawIndexed(indices, gl.TRIANGLE_FAN);
    }

    if (this.triPending.length > 0) {
      this._drawIndexed(this.triPending, gl.POINTS);
    }
  }

  _drawIndexed(indices, mode) {
    const gl = this.gl;
    const v = this.vertices[indices[0]];
    gl.uniform3f(this.uColor, v.r, v.g, v.b);

    const data = new Float32Array(indices.flatMap(i => [this.vertices[i].x, this.vertices[i].y]));
    const tmpBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tmpBuf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STREAM_DRAW);
    gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(mode, 0, indices.length);
    gl.deleteBuffer(tmpBuf);
  }

  clear() {
    this.vertices = []; this.pointIdx = []; this.triIdx = []; 
    this.circleGroups = []; this.triPending = []; this.circPending = null;
    this.render();
  }
}

export function colorToRGB(hex) {
  const n = parseInt(hex.replace('#',''), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}
=======
// ── renderer.js ──
// WebGL shader programs + unified draw call for points / triangles / circles

import { setupWebGL, createProgram } from './webgl-utils.js';

// ── Shader sources ──────────────────────────────────────────────────────────

// Vertex Shader: Receives coordinates from the buffer
const VS_SRC = `
  attribute vec2 aPosition;
  void main() {
    gl_Position  = vec4(aPosition, 0.0, 1.0);
    gl_PointSize = 8.0;
  }
`;

// Fragment Shader: Uses uColor (uniform) to color the pixels
const FS_SRC = `
  precision mediump float;
  uniform vec3 uColor; 
  void main() {
    // Check if we are drawing a POINT (Zaвдання 1)
    // Creates a soft circular shape instead of a square
    if (length(gl_PointCoord - vec2(0.5)) > 0.5) {
      discard;
    }
    gl_FragColor = vec4(uColor, 1.0);
  }
`;

// ── Renderer class ───────────────────────────────────────────────────────────

export class Renderer {
  constructor(canvasId) {
    this.gl      = setupWebGL(canvasId);
    this.canvas  = document.getElementById(canvasId);
    this.prog    = createProgram(this.gl, VS_SRC, FS_SRC);

    const gl     = this.gl;
    gl.useProgram(this.prog);

    this.uColor  = gl.getUniformLocation(this.prog, 'uColor');
    this.aPos    = gl.getAttribLocation(this.prog,  'aPosition');

    // Vertex buffer (dynamic — updated every frame)
    this.vbo     = gl.createBuffer();

    // ── Vertex store ──
    // Each vertex: { x, y, r, g, b }
    this.vertices = []; // all accumulated vertices

    // ── Index lists per primitive type ──
    this.pointIdx    = [];  // indices of point vertices
    this.triIdx      = [];  // indices of triangle vertices (groups of 3)
    this.circleGroups = []; // array of { centerIdx, edgeIndices[] }

    // ── Temp state for multi-click primitives ──
    this.triPending   = [];   // 0..2 vertices waiting to form a triangle
    this.circPending  = null; // { centerIdx } — waiting for radius click
  }

  // ── Add a vertex, return its index ──────────────────────────────────────
  addVertex(x, y, color) {
    const idx = this.vertices.length;
    this.vertices.push({ x, y, ...colorToRGB(color) });
    return idx;
  }

  // ── Upload all vertices to GPU ──────────────────────────────────────────
  _upload() {
    const gl   = this.gl;
    const data = new Float32Array(this.vertices.flatMap(v => [v.x, v.y]));
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.aPos);
    gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);
  }

  // ── Draw everything ──────────────────────────────────────────────────────
  render() {
    const gl = this.gl;
    if (this.vertices.length === 0) {
      gl.clearColor(0.165, 0.153, 0.145, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return;
    }

    gl.clearColor(0.165, 0.153, 0.145, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    this._upload();

    // 1 — Draw all points (one drawArrays call using index list)
    if (this.pointIdx.length > 0) {
      this._drawIndexed(this.pointIdx, gl.POINTS);
    }

    // 2 — Draw all triangles
    if (this.triIdx.length >= 3) {
      this._drawIndexed(this.triIdx, gl.TRIANGLES);
    }

    // 3 — Draw each circle with TRIANGLE_FAN
    for (const circle of this.circleGroups) {
      const indices = [circle.centerIdx, ...circle.edgeIndices];
      this._drawIndexed(indices, gl.TRIANGLE_FAN);
    }

    // 4 — Draw triangle-in-progress (ghost)
    if (this.triPending.length > 0) {
      this._drawIndexed(this.triPending, gl.POINTS);
    }
  }

  // Draw vertices by index, applying their stored color
  // Groups consecutive same-color vertices for fewer uniform updates
  _drawIndexed(indices, mode) {
    const gl = this.gl;
    const data = new Float32Array(indices.flatMap(i => [
      this.vertices[i].x,
      this.vertices[i].y
    ]));
    const tmpBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tmpBuf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);

    // Use the color of the first vertex in this group
    const v = this.vertices[indices[0]];
    gl.uniform3f(this.uColor, v.r, v.g, v.b);

    gl.drawArrays(mode, 0, indices.length);
    gl.deleteBuffer(tmpBuf);
  }

  // ── Clear everything ────────────────────────────────────────────────────
  clear() {
    this.vertices     = [];
    this.pointIdx     = [];
    this.triIdx       = [];
    this.circleGroups = [];
    this.triPending   = [];
    this.circPending  = null;
    this.render();
  }
}

// ── Color helper ─────────────────────────────────────────────────────────────
export function colorToRGB(hex) {
  const n = parseInt(hex.replace('#',''), 16);
  return {
    r: ((n >> 16) & 255) / 255,
    g: ((n >>  8) & 255) / 255,
    b: (  n       & 255) / 255,
  };
}

>>>>>>> d7fc285260cc2a6fe4e2cfac29b658c61ca8b138
