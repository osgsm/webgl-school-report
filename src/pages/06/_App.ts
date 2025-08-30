import { WebGLUtility } from '../../lib/webgl.js';
import { Vec3, Mat4 } from '../../lib/math.js';
import { WebGLGeometry } from '../../lib/geometry.js';

interface PlaneGeometry {
  position: number[];
  normal: number[];
  color: number[];
  texCoord: number[];
  index: number[];
}

export class App {
  canvas!: HTMLCanvasElement;
  gl!: WebGLRenderingContext;
  program!: WebGLProgram;
  attributeLocation!: number[];
  attributeStride!: number[];
  planeGeometry!: PlaneGeometry;
  planeVBO!: WebGLBuffer[];
  planeIBO!: WebGLBuffer;
  position!: number[];
  color!: number[];
  positionStride!: number;
  colorStride!: number;
  positionVbo!: WebGLBuffer;
  colorVbo!: WebGLBuffer;
  uniformLocation!: {
    mvpMatrix: WebGLUniformLocation | null;
    time: WebGLUniformLocation | null;
  };
  startTime!: number;
  isRendering!: boolean;

  init = () => {
    this.canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
    this.gl = WebGLUtility.createWebGLContext(this.canvas);

    this.resize();

    window.addEventListener('resize', this.resize, false);
  };

  resize = () => {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };

  load = () => {
    return new Promise<void>(async (resolve, reject) => {
      const gl = this.gl;
      if (gl == null) {
        const error = new Error('not initialized');
        reject(error);
      } else {
        const VSSource = await WebGLUtility.loadFile('/shaders/06/main.vert');
        const FSSource = await WebGLUtility.loadFile('/shaders/06/main.frag');
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
    const width = 1.0;
    const height = 0.5;
    const color = [1.0, 0.0, 0.0, 1.0];
    this.planeGeometry = WebGLGeometry.plane(
      width,
      height,
      color,
    ) as PlaneGeometry;

    this.planeVBO = [
      WebGLUtility.createVBO(this.gl, this.planeGeometry.position),
      WebGLUtility.createVBO(this.gl, this.planeGeometry.color),
    ];
    this.planeIBO = WebGLUtility.createIBO(this.gl, this.planeGeometry.index);
  };

  setupLocation = () => {
    const gl = this.gl;
    this.attributeLocation = [
      gl.getAttribLocation(this.program, 'position'),
      gl.getAttribLocation(this.program, 'color'),
    ];

    this.attributeStride = [3, 4];

    this.uniformLocation = {
      mvpMatrix: gl.getUniformLocation(this.program, 'mvpMatrix'),
      time: gl.getUniformLocation(this.program, 'time'),
    };
  };

  setupRendering = () => {
    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.enable(gl.DEPTH_TEST);
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

    const nowTime = (Date.now() - this.startTime) * 0.001;

    this.setupRendering();

    // モデル座標変換行列
    const rotateAxis = Vec3.create(0.0, 1.0, 0.0);
    const m = Mat4.rotate(Mat4.identity(), nowTime, rotateAxis);

    // ビュー座標変換行列
    const eye = Vec3.create(0.0, 0.0, 3.0); // カメラの位置
    const center = Vec3.create(0.0, 0.0, 0.0); // カメラの注視点
    const upDirection = Vec3.create(0.0, 1.0, 0.0); // カメラの天面の向き
    const v = Mat4.lookAt(eye, center, upDirection);

    // プロジェクション座標変換行列
    const fovy = 45;
    const aspect = this.canvas.width / this.canvas.height;
    const near = 0.1;
    const far = 100.0;
    const p = Mat4.perspective(fovy, aspect, near, far);

    // 行列を乗算して MVP 行列を生成する（掛ける順序に注意）
    // ※スクールのサンプルは列優先で行列を処理しています
    const vp = Mat4.multiply(p, v);
    const mvp = Mat4.multiply(vp, m);

    gl.useProgram(this.program);

    gl.uniformMatrix4fv(
      this.uniformLocation.mvpMatrix,
      false,
      mvp as Float32Array,
    );
    gl.uniform1f(this.uniformLocation.time, nowTime);

    WebGLUtility.enableBuffer(
      gl,
      this.planeVBO,
      this.attributeLocation,
      this.attributeStride,
      this.planeIBO,
    );
    gl.drawElements(
      gl.TRIANGLES,
      this.planeGeometry.index.length,
      gl.UNSIGNED_SHORT,
      0,
    );
  };
}
