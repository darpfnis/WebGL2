<<<<<<< HEAD
// ── webgl-utils.js ──
export function setupWebGL(canvasId) {
  const canvas = document.getElementById(canvasId);
  const gl = canvas.getContext('webgl');
  if (!gl) { alert('WebGL не підтримується'); return null; }
  gl.viewport(0, 0, canvas.width, canvas.height);
  return gl;
}

export function compileShader(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(`Shader compile error: ${log}`);
  }
  return sh;
}

export function createProgram(gl, vsSrc, fsSrc) {
  const prog = gl.createProgram();
  gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER,   vsSrc));
  gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, fsSrc));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(`Program link error: ${gl.getProgramInfoLog(prog)}`);
  }
  return prog;
}

export function toNDC(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x =  ((clientX - rect.left)  / rect.width)  * 2 - 1;
  const y = -((clientY - rect.top)   / rect.height) * 2 + 1;
  return [x, y];
}
=======
// ── webgl-utils.js ──
// Shared WebGL helpers

export function setupWebGL(canvasId) {
  const canvas = document.getElementById(canvasId);
  const gl = canvas.getContext('webgl');
  if (!gl) { alert('WebGL не підтримується'); return null; }
  gl.viewport(0, 0, canvas.width, canvas.height);
  return gl;
}

export function compileShader(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(`Shader compile error: ${log}`);
  }
  return sh;
}

export function createProgram(gl, vsSrc, fsSrc) {
  const prog = gl.createProgram();
  gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER,   vsSrc));
  gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, fsSrc));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(`Program link error: ${gl.getProgramInfoLog(prog)}`);
  }
  return prog;
}

// Convert canvas click position → WebGL NDC coords [-1, 1]
// Uses getBoundingClientRect to fix cursor offset
export function toNDC(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x =  ((clientX - rect.left)  / rect.width)  * 2 - 1;
  const y = -((clientY - rect.top)   / rect.height) * 2 + 1;
  return [x, y];
}
>>>>>>> d7fc285260cc2a6fe4e2cfac29b658c61ca8b138
