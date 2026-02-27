import { setupWebGL, createProgram } from './webgl-utils.js';

const VS_SRC = `
  attribute vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    gl_PointSize = 8.0;
  }
`;

const FS_SRC = `
  precision mediump float;
  uniform vec3 uColor;
  void main() {
    // Малювання круглих точок
    if (gl_PointSize > 1.0 && length(gl_PointCoord - vec2(0.5)) > 0.5) discard;
    gl_FragColor = vec4(uColor, 1.0);
  }
`;

export class Renderer {
  constructor(canvasId) {
    this.gl = setupWebGL(canvasId);
    this.canvas = document.getElementById(canvasId);
    this.prog = createProgram(this.gl, VS_SRC, FS_SRC);
    this.gl.useProgram(this.prog);

    this.uColor = this.gl.getUniformLocation(this.prog, 'uColor');
    this.aPos = this.gl.getAttribLocation(this.prog, 'aPosition');
    this.vbo = this.gl.createBuffer();

    this.vertices = [];
    this.pointIdx = [];
    this.triIdx = [];
    this.circleGroups = [];
    this.triPending = [];
    this.circPending = null;
  }

  addVertex(x, y, color) {
    const idx = this.vertices.length;
    const { r, g, b } = this.colorToRGB(color);
    this.vertices.push({ x, y, r, g, b });
    return idx;
  }

  colorToRGB(hex) {
    const n = parseInt(hex.replace('#',''), 16);
    return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
  }

  render() {
    const gl = this.gl;
    gl.clearColor(0.165, 0.153, 0.145, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (this.vertices.length === 0) return;

    // Малюємо точки окремо
    for (const idx of this.pointIdx) {
      this._drawSinglePrimitive([idx], gl.POINTS);
    }

    // Малюємо трикутники (по 3 вершини)
    for (let i = 0; i < this.triIdx.length; i += 3) {
      this._drawSinglePrimitive(this.triIdx.slice(i, i + 3), gl.TRIANGLES);
    }

    // Малюємо кола
    for (const circ of this.circleGroups) {
      this._drawSinglePrimitive([circ.centerIdx, ...circ.edgeIndices], gl.TRIANGLE_FAN);
    }

    // Тимчасові точки при побудові
    if (this.triPending.length > 0) this._drawSinglePrimitive(this.triPending, gl.POINTS);
  }

  _drawSinglePrimitive(indices, mode) {
    const gl = this.gl;
    const v = this.vertices[indices[0]];
    gl.uniform3f(this.uColor, v.r, v.g, v.b);

    const data = new Float32Array(indices.flatMap(i => [this.vertices[i].x, this.vertices[i].y]));
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STREAM_DRAW);
    gl.enableVertexAttribArray(this.aPos);
    gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(mode, 0, indices.length);
  }

  clear() {
    this.vertices = []; this.pointIdx = []; this.triIdx = []; this.circleGroups = [];
    this.triPending = []; this.circPending = null;
    this.render();
  }
}