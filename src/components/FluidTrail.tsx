import { useEffect, useRef } from "react";

// WebGL fluid simulation cursor trail (Navier-Stokes with vorticity
// confinement), adapted from Pavel Dobryakov's MIT-licensed
// WebGL-Fluid-Simulation. Dye dissipation is tuned so the trail fades in
// roughly half a second; splat colors are restricted to the site palette.

const SIM_RESOLUTION = 128;
const DYE_RESOLUTION = 512;
const DENSITY_DISSIPATION = 5.5; // ~0.5s visible fade
const VELOCITY_DISSIPATION = 2.2;
const PRESSURE = 0.8;
const PRESSURE_ITERATIONS = 20;
const CURL = 22;
const SPLAT_RADIUS = 0.16;
const SPLAT_FORCE = 5500;

// dark blue / pastel blue / white, weighted toward the blues
const PALETTE: [number, number, number][] = [
  [0.01, 0.06, 0.35],
  [0.01, 0.06, 0.35],
  [0.22, 0.45, 0.9],
  [0.22, 0.45, 0.9],
  [0.65, 0.78, 0.95],
];

export default function FluidTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(hover: none), (prefers-reduced-motion: reduce)").matches) return;

    const cleanup = startFluid(canvas);
    return cleanup;
  }, []);

  return <canvas className="fluid-trail" ref={canvasRef} aria-hidden="true" />;
}

// ── Simulation ───────────────────────────────────────────────────────────────

type GL = WebGLRenderingContext | WebGL2RenderingContext;

type FBO = {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach: (id: number) => number;
};

type DoubleFBO = {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  read: FBO;
  write: FBO;
  swap: () => void;
};

function startFluid(canvas: HTMLCanvasElement): () => void {
  const params = { alpha: true, depth: false, stencil: false, antialias: false, premultipliedAlpha: true };
  let gl = canvas.getContext("webgl2", params) as GL | null;
  const isWebGL2 = !!gl;
  if (!gl) {
    gl = (canvas.getContext("webgl", params) ||
      canvas.getContext("experimental-webgl", params)) as GL | null;
  }
  if (!gl) return () => {};

  let halfFloat: OES_texture_half_float | null = null;
  let supportLinearFiltering: unknown;
  if (isWebGL2) {
    (gl as WebGL2RenderingContext).getExtension("EXT_color_buffer_float");
    supportLinearFiltering = gl.getExtension("OES_texture_float_linear");
  } else {
    halfFloat = gl.getExtension("OES_texture_half_float");
    supportLinearFiltering = gl.getExtension("OES_texture_half_float_linear");
  }
  const halfFloatTexType = isWebGL2
    ? (gl as WebGL2RenderingContext).HALF_FLOAT
    : halfFloat
      ? halfFloat.HALF_FLOAT_OES
      : 0;
  if (!halfFloatTexType) return () => {};

  const gl2 = gl as WebGL2RenderingContext; // enum access; safe for constants

  function getSupportedFormat(
    internalFormat: number,
    format: number,
    type: number
  ): { internalFormat: number; format: number } | null {
    if (!supportRenderTextureFormat(internalFormat, format, type)) {
      if (!isWebGL2) return null;
      switch (internalFormat) {
        case gl2.R16F:
          return getSupportedFormat(gl2.RG16F, gl2.RG, type);
        case gl2.RG16F:
          return getSupportedFormat(gl2.RGBA16F, gl2.RGBA, type);
        default:
          return null;
      }
    }
    return { internalFormat, format };
  }

  function supportRenderTextureFormat(internalFormat: number, format: number, type: number) {
    const g = gl!;
    const texture = g.createTexture();
    g.bindTexture(g.TEXTURE_2D, texture);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.NEAREST);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.NEAREST);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
    g.texImage2D(g.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
    const fbo = g.createFramebuffer();
    g.bindFramebuffer(g.FRAMEBUFFER, fbo);
    g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, texture, 0);
    return g.checkFramebufferStatus(g.FRAMEBUFFER) === g.FRAMEBUFFER_COMPLETE;
  }

  const formatRGBA = isWebGL2
    ? getSupportedFormat(gl2.RGBA16F, gl2.RGBA, halfFloatTexType)
    : getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatTexType);
  const formatRG = isWebGL2
    ? getSupportedFormat(gl2.RG16F, gl2.RG, halfFloatTexType)
    : formatRGBA;
  const formatR = isWebGL2
    ? getSupportedFormat(gl2.R16F, gl2.RED, halfFloatTexType)
    : formatRGBA;
  if (!formatRGBA || !formatRG || !formatR) return () => {};

  // ── Shaders ────────────────────────────────────────────────────────────────

  function compileShader(type: number, source: string) {
    const shader = gl!.createShader(type)!;
    gl!.shaderSource(shader, source);
    gl!.compileShader(shader);
    if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
      console.error("FluidTrail shader compile failed:", gl!.getShaderInfoLog(shader));
    }
    return shader;
  }

  const baseVertex = compileShader(
    gl.VERTEX_SHADER,
    `precision highp float;
    attribute vec2 aPosition;
    varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
    uniform vec2 texelSize;
    void main () {
      vUv = aPosition * 0.5 + 0.5;
      vL = vUv - vec2(texelSize.x, 0.0);
      vR = vUv + vec2(texelSize.x, 0.0);
      vT = vUv + vec2(0.0, texelSize.y);
      vB = vUv - vec2(0.0, texelSize.y);
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }`
  );

  function frag(source: string) {
    return compileShader(gl!.FRAGMENT_SHADER, `precision highp float; precision highp sampler2D; ${source}`);
  }

  const clearFrag = frag(
    `varying vec2 vUv; uniform sampler2D uTexture; uniform float value;
    void main () { gl_FragColor = value * texture2D(uTexture, vUv); }`
  );

  const displayFrag = frag(
    `varying vec2 vUv; uniform sampler2D uTexture;
    void main () {
      vec3 c = texture2D(uTexture, vUv).rgb;
      float a = clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0);
      gl_FragColor = vec4(c, a);
    }`
  );

  const splatFrag = frag(
    `varying vec2 vUv; uniform sampler2D uTarget; uniform float aspectRatio;
    uniform vec3 color; uniform vec2 point; uniform float radius;
    void main () {
      vec2 p = vUv - point.xy;
      p.x *= aspectRatio;
      vec3 splat = exp(-dot(p, p) / radius) * color;
      vec3 base = texture2D(uTarget, vUv).xyz;
      gl_FragColor = vec4(base + splat, 1.0);
    }`
  );

  const advectionFrag = frag(
    `varying vec2 vUv; uniform sampler2D uVelocity; uniform sampler2D uSource;
    uniform vec2 texelSize; uniform vec2 dyeTexelSize; uniform float dt; uniform float dissipation;
    ${supportLinearFiltering ? "" : "#define MANUAL_FILTERING"}
    #ifdef MANUAL_FILTERING
    vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
      vec2 st = uv / tsize - 0.5;
      vec2 iuv = floor(st); vec2 fuv = fract(st);
      vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
      vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
      vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
      vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
      return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
    }
    #endif
    void main () {
      #ifdef MANUAL_FILTERING
      vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
      vec4 result = bilerp(uSource, coord, dyeTexelSize);
      #else
      vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
      vec4 result = texture2D(uSource, coord);
      #endif
      float decay = 1.0 + dissipation * dt;
      gl_FragColor = result / decay;
    }`
  );

  const divergenceFrag = frag(
    `varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uVelocity, vL).x;
      float R = texture2D(uVelocity, vR).x;
      float T = texture2D(uVelocity, vT).y;
      float B = texture2D(uVelocity, vB).y;
      vec2 C = texture2D(uVelocity, vUv).xy;
      if (vL.x < 0.0) { L = -C.x; }
      if (vR.x > 1.0) { R = -C.x; }
      if (vT.y > 1.0) { T = -C.y; }
      if (vB.y < 0.0) { B = -C.y; }
      float div = 0.5 * (R - L + T - B);
      gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }`
  );

  const curlFrag = frag(
    `varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uVelocity, vL).y;
      float R = texture2D(uVelocity, vR).y;
      float T = texture2D(uVelocity, vT).x;
      float B = texture2D(uVelocity, vB).x;
      float vorticity = R - L - T + B;
      gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
    }`
  );

  const vorticityFrag = frag(
    `varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
    uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt;
    void main () {
      float L = texture2D(uCurl, vL).x;
      float R = texture2D(uCurl, vR).x;
      float T = texture2D(uCurl, vT).x;
      float B = texture2D(uCurl, vB).x;
      float C = texture2D(uCurl, vUv).x;
      vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      force /= length(force) + 0.0001;
      force *= curl * C;
      force.y *= -1.0;
      vec2 velocity = texture2D(uVelocity, vUv).xy;
      velocity += force * dt;
      velocity = min(max(velocity, -1000.0), 1000.0);
      gl_FragColor = vec4(velocity, 0.0, 1.0);
    }`
  );

  const pressureFrag = frag(
    `varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
    uniform sampler2D uPressure; uniform sampler2D uDivergence;
    void main () {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      float divergence = texture2D(uDivergence, vUv).x;
      float pressure = (L + R + B + T - divergence) * 0.25;
      gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }`
  );

  const gradientSubtractFrag = frag(
    `varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
    uniform sampler2D uPressure; uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      vec2 velocity = texture2D(uVelocity, vUv).xy;
      velocity.xy -= vec2(R - L, T - B);
      gl_FragColor = vec4(velocity, 0.0, 1.0);
    }`
  );

  class Program {
    program: WebGLProgram;
    uniforms: Record<string, WebGLUniformLocation | null> = {};

    constructor(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
      const g = gl!;
      this.program = g.createProgram()!;
      g.attachShader(this.program, vertexShader);
      g.attachShader(this.program, fragmentShader);
      g.linkProgram(this.program);
      if (!g.getProgramParameter(this.program, g.LINK_STATUS)) {
        console.error("FluidTrail program link failed:", g.getProgramInfoLog(this.program));
      }
      const count = g.getProgramParameter(this.program, g.ACTIVE_UNIFORMS) as number;
      for (let i = 0; i < count; i++) {
        const info = g.getActiveUniform(this.program, i);
        if (info) this.uniforms[info.name] = g.getUniformLocation(this.program, info.name);
      }
    }

    bind() {
      gl!.useProgram(this.program);
    }
  }

  const clearProgram = new Program(baseVertex, clearFrag);
  const displayProgram = new Program(baseVertex, displayFrag);
  const splatProgram = new Program(baseVertex, splatFrag);
  const advectionProgram = new Program(baseVertex, advectionFrag);
  const divergenceProgram = new Program(baseVertex, divergenceFrag);
  const curlProgram = new Program(baseVertex, curlFrag);
  const vorticityProgram = new Program(baseVertex, vorticityFrag);
  const pressureProgram = new Program(baseVertex, pressureFrag);
  const gradientSubtractProgram = new Program(baseVertex, gradientSubtractFrag);

  // ── Geometry / blit ────────────────────────────────────────────────────────

  const quadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  function blit(target: FBO | null) {
    const g = gl!;
    if (target == null) {
      g.viewport(0, 0, g.drawingBufferWidth, g.drawingBufferHeight);
      g.bindFramebuffer(g.FRAMEBUFFER, null);
    } else {
      g.viewport(0, 0, target.width, target.height);
      g.bindFramebuffer(g.FRAMEBUFFER, target.fbo);
    }
    g.drawElements(g.TRIANGLES, 6, g.UNSIGNED_SHORT, 0);
  }

  // ── Framebuffers ───────────────────────────────────────────────────────────

  function createFBO(w: number, h: number, internalFormat: number, format: number, type: number, filter: number): FBO {
    const g = gl!;
    const texture = g.createTexture()!;
    g.activeTexture(g.TEXTURE0);
    g.bindTexture(g.TEXTURE_2D, texture);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, filter);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, filter);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
    g.texImage2D(g.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
    const fbo = g.createFramebuffer()!;
    g.bindFramebuffer(g.FRAMEBUFFER, fbo);
    g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, texture, 0);
    g.viewport(0, 0, w, h);
    g.clearColor(0, 0, 0, 0);
    g.clear(g.COLOR_BUFFER_BIT);
    return {
      texture,
      fbo,
      width: w,
      height: h,
      texelSizeX: 1 / w,
      texelSizeY: 1 / h,
      attach(id: number) {
        g.activeTexture(g.TEXTURE0 + id);
        g.bindTexture(g.TEXTURE_2D, texture);
        return id;
      },
    };
  }

  function createDoubleFBO(w: number, h: number, internalFormat: number, format: number, type: number, filter: number): DoubleFBO {
    let fbo1 = createFBO(w, h, internalFormat, format, type, filter);
    let fbo2 = createFBO(w, h, internalFormat, format, type, filter);
    return {
      width: w,
      height: h,
      texelSizeX: fbo1.texelSizeX,
      texelSizeY: fbo1.texelSizeY,
      get read() {
        return fbo1;
      },
      get write() {
        return fbo2;
      },
      swap() {
        const temp = fbo1;
        fbo1 = fbo2;
        fbo2 = temp;
      },
    } as unknown as DoubleFBO;
  }

  function getResolution(resolution: number) {
    const g = gl!;
    let aspect = g.drawingBufferWidth / g.drawingBufferHeight;
    if (aspect < 1) aspect = 1 / aspect;
    const min = Math.round(resolution);
    const max = Math.round(resolution * aspect);
    return g.drawingBufferWidth > g.drawingBufferHeight
      ? { width: max, height: min }
      : { width: min, height: max };
  }

  const filtering = supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
  let dye: DoubleFBO;
  let velocity: DoubleFBO;
  let divergence: FBO;
  let curl: FBO;
  let pressure: DoubleFBO;

  function initFramebuffers() {
    const simRes = getResolution(SIM_RESOLUTION);
    const dyeRes = getResolution(DYE_RESOLUTION);
    dye = createDoubleFBO(dyeRes.width, dyeRes.height, formatRGBA!.internalFormat, formatRGBA!.format, halfFloatTexType, filtering);
    velocity = createDoubleFBO(simRes.width, simRes.height, formatRG!.internalFormat, formatRG!.format, halfFloatTexType, filtering);
    divergence = createFBO(simRes.width, simRes.height, formatR!.internalFormat, formatR!.format, halfFloatTexType, gl!.NEAREST);
    curl = createFBO(simRes.width, simRes.height, formatR!.internalFormat, formatR!.format, halfFloatTexType, gl!.NEAREST);
    pressure = createDoubleFBO(simRes.width, simRes.height, formatR!.internalFormat, formatR!.format, halfFloatTexType, gl!.NEAREST);
  }

  function resizeCanvas() {
    const width = Math.floor(canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 2));
    const height = Math.floor(canvas.clientHeight * Math.min(window.devicePixelRatio || 1, 2));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      return true;
    }
    return false;
  }

  resizeCanvas();
  initFramebuffers();

  // ── Pointer ────────────────────────────────────────────────────────────────

  const pointer = {
    texcoordX: 0.5,
    texcoordY: 0.5,
    prevTexcoordX: 0.5,
    prevTexcoordY: 0.5,
    deltaX: 0,
    deltaY: 0,
    moved: false,
  };

  function onMouseMove(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1 - (e.clientY - rect.top) / rect.height;
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.texcoordX = x;
    pointer.texcoordY = y;
    pointer.deltaX = correctDeltaX(x - pointer.prevTexcoordX);
    pointer.deltaY = correctDeltaY(y - pointer.prevTexcoordY);
    pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
  }

  function correctDeltaX(delta: number) {
    const aspect = canvas.width / canvas.height;
    return aspect < 1 ? delta * aspect : delta;
  }

  function correctDeltaY(delta: number) {
    const aspect = canvas.width / canvas.height;
    return aspect > 1 ? delta / aspect : delta;
  }

  function pickColor(): [number, number, number] {
    const base = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    const jitter = 0.85 + Math.random() * 0.3;
    return [base[0] * jitter, base[1] * jitter, base[2] * jitter];
  }

  function splat(x: number, y: number, dx: number, dy: number, color: [number, number, number]) {
    const g = gl!;
    splatProgram.bind();
    g.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
    g.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
    g.uniform2f(splatProgram.uniforms.point, x, y);
    g.uniform3f(splatProgram.uniforms.color, dx, dy, 0);
    g.uniform1f(splatProgram.uniforms.radius, correctRadius(SPLAT_RADIUS / 100));
    blit(velocity.write);
    velocity.swap();

    g.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
    g.uniform3f(splatProgram.uniforms.color, color[0], color[1], color[2]);
    blit(dye.write);
    dye.swap();
  }

  function correctRadius(radius: number) {
    const aspect = canvas.width / canvas.height;
    return aspect > 1 ? radius * aspect : radius;
  }

  // ── Frame loop ─────────────────────────────────────────────────────────────

  let lastTime = performance.now();
  let raf = 0;

  function step(dt: number) {
    const g = gl!;
    g.disable(g.BLEND);

    curlProgram.bind();
    g.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    g.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
    blit(curl);

    vorticityProgram.bind();
    g.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    g.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
    g.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
    g.uniform1f(vorticityProgram.uniforms.curl, CURL);
    g.uniform1f(vorticityProgram.uniforms.dt, dt);
    blit(velocity.write);
    velocity.swap();

    divergenceProgram.bind();
    g.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    g.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
    blit(divergence);

    clearProgram.bind();
    g.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
    g.uniform1f(clearProgram.uniforms.value, PRESSURE);
    blit(pressure.write);
    pressure.swap();

    pressureProgram.bind();
    g.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    g.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
    for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
      g.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
      blit(pressure.write);
      pressure.swap();
    }

    gradientSubtractProgram.bind();
    g.uniform2f(gradientSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    g.uniform1i(gradientSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
    g.uniform1i(gradientSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
    blit(velocity.write);
    velocity.swap();

    advectionProgram.bind();
    g.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    if (!supportLinearFiltering) {
      g.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
    }
    g.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
    g.uniform1i(advectionProgram.uniforms.uSource, velocity.read.attach(0));
    g.uniform1f(advectionProgram.uniforms.dt, dt);
    g.uniform1f(advectionProgram.uniforms.dissipation, VELOCITY_DISSIPATION);
    blit(velocity.write);
    velocity.swap();

    if (!supportLinearFiltering) {
      g.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
    }
    g.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
    g.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
    g.uniform1f(advectionProgram.uniforms.dissipation, DENSITY_DISSIPATION);
    blit(dye.write);
    dye.swap();
  }

  function render() {
    const g = gl!;
    g.enable(g.BLEND);
    g.blendFunc(g.ONE, g.ONE_MINUS_SRC_ALPHA);
    displayProgram.bind();
    g.uniform1i(displayProgram.uniforms.uTexture, dye.read.attach(0));
    blit(null);
  }

  function frame() {
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.016666);
    lastTime = now;

    if (resizeCanvas()) initFramebuffers();

    if (pointer.moved) {
      pointer.moved = false;
      splat(
        pointer.texcoordX,
        pointer.texcoordY,
        pointer.deltaX * SPLAT_FORCE,
        pointer.deltaY * SPLAT_FORCE,
        pickColor()
      );
    }

    step(dt);
    render();
    raf = requestAnimationFrame(frame);
  }

  window.addEventListener("mousemove", onMouseMove, { passive: true });
  raf = requestAnimationFrame(frame);

  return () => {
    window.removeEventListener("mousemove", onMouseMove);
    cancelAnimationFrame(raf);
  };
}
