import { WebGLUtility } from '../../lib/webgl.js';
import { Vec3, Mat4 } from '../../lib/math.js';
import { WebGLGeometry } from '../../lib/geometry.js';
import { WebGLOrbitCamera } from '../../lib/camera.js';

export class App {
  canvas!: HTMLCanvasElement;
  gl!: WebGLRenderingContext;
  program!: WebGLProgram;
  attributeLocation!: number[];
  attributeStride!: number[];
  torusGeometry!: any;
  torusVBO!: WebGLBuffer[];
  torusIBO!: WebGLBuffer;
  position!: number[];
  color!: number[];
  positionStride!: number;
  colorStride!: number;
  positionVbo!: WebGLBuffer;
  colorVbo!: WebGLBuffer;
  uniformLocation!: {
    mvpMatrix: WebGLUniformLocation | null;
    normalMatrix: WebGLUniformLocation | null;
    time: WebGLUniformLocation | null;
    ambientColor: WebGLUniformLocation | null;
  };
  startTime!: number;
  isRendering!: boolean;
  isRotation!: boolean;
  camera!: WebGLOrbitCamera;
  ambientColor!: number[];

  /**
   * バックフェイスカリングを設定する
   * @param {boolean} flag - 設定する値
   */
  setCulling(flag: boolean) {
    const gl = this.gl;
    if (gl == null) {
      return;
    }
    if (flag === true) {
      gl.enable(gl.CULL_FACE);
    } else {
      gl.disable(gl.CULL_FACE);
    }
  }

  /**
   * 深度テストを設定する
   * @param {boolean} flag - 設定する値
   */
  setDepthTest(flag: boolean) {
    const gl = this.gl;
    if (gl == null) {
      return;
    }
    if (flag === true) {
      gl.enable(gl.DEPTH_TEST);
    } else {
      gl.disable(gl.DEPTH_TEST);
    }
  }

  /**
   * isRotation を設定する
   * @param {boolean} flag - 設定する値
   */
  setRotation(flag: boolean) {
    this.isRotation = flag;
  }

  init = () => {
    this.canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
    this.gl = WebGLUtility.createWebGLContext(this.canvas);

    const cameraOption = {
      destance: 3.0,
      min: 1.0,
      max: 10.0,
      move: 2.0,
    };
    this.camera = new WebGLOrbitCamera(this.canvas, cameraOption);

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
    const row = 32;
    const column = 32;
    const innerRadius = 0.4;
    const outerRadius = 0.8;
    const color = [1.0, 1.0, 1.0, 1.0];
    this.torusGeometry = WebGLGeometry.torus(
      row,
      column,
      innerRadius,
      outerRadius,
      color,
    );

    this.torusVBO = [
      WebGLUtility.createVBO(this.gl, this.torusGeometry.position),
      WebGLUtility.createVBO(this.gl, this.torusGeometry.normal),
      WebGLUtility.createVBO(this.gl, this.torusGeometry.color),
    ];
    this.torusIBO = WebGLUtility.createIBO(this.gl, this.torusGeometry.index);
  };

  setupLight = () => {
    this.ambientColor = [0.1, 0.1, 0.1, 1.0];
  };

  setupLocation = () => {
    const gl = this.gl;
    this.attributeLocation = [
      gl.getAttribLocation(this.program, 'position'),
      gl.getAttribLocation(this.program, 'normal'),
      gl.getAttribLocation(this.program, 'color'),
    ];

    this.attributeStride = [3, 3, 4];

    this.uniformLocation = {
      mvpMatrix: gl.getUniformLocation(this.program, 'mvpMatrix'),
      normalMatrix: gl.getUniformLocation(this.program, 'normalMatrix'),
      time: gl.getUniformLocation(this.program, 'time'),
      ambientColor: gl.getUniformLocation(this.program, 'ambientColor'),
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
    const m =
      this.isRotation === true
        ? Mat4.rotate(Mat4.identity(), nowTime, rotateAxis)
        : Mat4.identity();

    // ビュー座標変換行列はカメラクラスの更新処理の戻り値から取得する
    const v = this.camera.update();

    // プロジェクション座標変換行列
    const fovy = 45;
    const aspect = this.canvas.width / this.canvas.height;
    const near = 0.1;
    const far = 100.0;
    const p = Mat4.perspective(fovy, aspect, near, far);

    // 行列を乗算して MVP 行列を生成する（掛ける順序に注意）
    const vp = Mat4.multiply(p, v);
    const mvp = Mat4.multiply(vp, m);

    // モデル座標変換行列の逆転置行列を生成する
    const normalMatrix = Mat4.transpose(Mat4.inverse(m));

    gl.useProgram(this.program);

    gl.uniformMatrix4fv(
      this.uniformLocation.mvpMatrix,
      false,
      mvp as Float32Array,
    );
    gl.uniformMatrix4fv(
      this.uniformLocation.normalMatrix,
      false,
      normalMatrix as Float32Array,
    );
    gl.uniform4fv(this.uniformLocation.ambientColor, this.ambientColor);
    gl.uniform1f(this.uniformLocation.time, nowTime);

    WebGLUtility.enableBuffer(
      gl,
      this.torusVBO,
      this.attributeLocation,
      this.attributeStride,
      this.torusIBO,
    );
    gl.drawElements(
      gl.TRIANGLES,
      this.torusGeometry.index.length,
      gl.UNSIGNED_SHORT,
      0,
    );
  };
}
