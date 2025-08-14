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
    // prettier-ignore
    this.position = [
      0.0, 0.5, 0.0,
      0.5, -0.5, 0.0,
      -0.5, -0.5, 0.0,
    ];
    this.positionStride = 3;
    this.positionVbo = WebGLUtility.createVBO(this.gl, this.position);

    // prettier-ignore
    this.color = [
      1.0, 0.0, 0.0, 1.0,
      0.0, 1.0, 0.0, 1.0,
      0.0, 0.0, 1.0, 1.0,
    ];
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
  };

  setupRendering = () => {
    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  };

  render = () => {
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.drawArrays(gl.TRIANGLES, 0, this.position.length / this.positionStride);
  };
}
