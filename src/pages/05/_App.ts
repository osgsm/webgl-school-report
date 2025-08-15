import { WebGLUtility } from '../../lib/webgl.js';

export class App {
  canvas!: HTMLCanvasElement;
  gl!: WebGLRenderingContext;
  program!: WebGLProgram;
  position!: number[];
  color!: number[];
  positionStride!: number;
  colorStride!: number;
  positionVbo!: WebGLBuffer;
  colorVbo!: WebGLBuffer;
  uniformLocation!: {
    time: WebGLUniformLocation | null;
  };
  startTime!: number;
  isRendering!: boolean;

  init = () => {
    this.canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
    this.gl = WebGLUtility.createWebGLContext(this.canvas);

    const size = Math.min(window.innerWidth, window.innerHeight);
    this.canvas.width = size;
    this.canvas.height = size;
  };

  load = () => {
    return new Promise<void>(async (resolve, reject) => {
      const gl = this.gl;
      if (gl == null) {
        const error = new Error('not initialized');
        reject(error);
      } else {
        const VSSource = await WebGLUtility.loadFile('/shaders/05/main.vert');
        const FSSource = await WebGLUtility.loadFile('/shaders/05/main.frag');
        const vertexShader = WebGLUtility.createShaderObject(
          gl,
          VSSource,
          gl.VERTEX_SHADER,
        );
        const fragmentShader = WebGLUtility.createShaderObject(
          gl,
          FSSource,
          gl.FRAGMENT_SHADER,
        );
        this.program = WebGLUtility.createProgramObject(
          gl,
          vertexShader,
          fragmentShader,
        );
        resolve();
      }
    });
  };

  setupGeometry = () => {
    const radius = 0.5;
    const centerX = 0.0;
    const centerY = 0.0;
    const centerZ = 0.0;
    const numVertices = 20;
    const startAngle = Math.PI / 2;

    const polygonVertices = [];
    for (let i = 0; i < numVertices; i++) {
      const angle = startAngle + (i * 2 * Math.PI) / numVertices;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      polygonVertices.push(x, y, centerZ);
    }

    this.position = [];
    this.position.push(centerX, centerY, centerZ);

    for (let i = 0; i < numVertices; i++) {
      const currentIndex = i * 3;
      const nextIndex = ((i + 1) % numVertices) * 3;

      this.position.push(
        polygonVertices[currentIndex],
        polygonVertices[currentIndex + 1],
        polygonVertices[currentIndex + 2],
      );
      this.position.push(
        polygonVertices[nextIndex],
        polygonVertices[nextIndex + 1],
        polygonVertices[nextIndex + 2],
      );
      this.position.push(centerX, centerY, centerZ);
    }
    this.positionStride = 3;
    this.positionVbo = WebGLUtility.createVBO(this.gl, this.position);

    this.color = [];
    this.color.push(1.0, 1.0, 1.0, 1.0);

    const baseColors = [
      [1.0, 0.0, 0.0, 1.0],
      [0.0, 1.0, 0.0, 1.0],
      [0.0, 0.0, 1.0, 1.0],
    ];

    for (let i = 0; i < numVertices; i++) {
      const currentColorIndex = i % baseColors.length;
      const nextColorIndex = (i + 1) % baseColors.length;

      const currentColor = baseColors[currentColorIndex];
      const nextColor = baseColors[nextColorIndex];

      this.color.push(...currentColor);
      this.color.push(...nextColor);
      this.color.push(1.0, 1.0, 1.0, 1.0);
    }
    this.colorStride = 4;
    this.colorVbo = WebGLUtility.createVBO(this.gl, this.color);
  };

  setupLocation = () => {
    const gl = this.gl;
    const positionAttributeLocation = gl.getAttribLocation(
      this.program,
      'position',
    );
    const colorAttributeLocation = gl.getAttribLocation(this.program, 'color');
    const vboArray = [this.positionVbo, this.colorVbo];
    const attributeLocationArray = [
      positionAttributeLocation,
      colorAttributeLocation,
    ];
    const strideArray = [this.positionStride, this.colorStride];
    WebGLUtility.enableBuffer(
      gl,
      vboArray,
      attributeLocationArray,
      strideArray,
    );

    this.uniformLocation = {
      time: gl.getUniformLocation(this.program, 'time'),
    };
  };

  setupRendering = () => {
    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  };

  start = () => {
    this.startTime = Date.now();
    this.isRendering = true;
    this.render();
  };

  stop = () => {
    this.isRendering = false;
  };

  render = () => {
    const gl = this.gl;

    if (this.isRendering) {
      requestAnimationFrame(this.render);
    }

    this.setupRendering();

    const nowTime = (Date.now() - this.startTime) * 0.001;

    gl.useProgram(this.program);

    gl.uniform1f(this.uniformLocation.time, nowTime);

    gl.drawArrays(gl.TRIANGLES, 0, this.position.length / this.positionStride);
  };
}
