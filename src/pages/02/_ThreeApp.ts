import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Pane } from 'tweakpane';

export class ThreeApp {
  static CAMERA_PARAM = {
    fovy: 60,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 10.0,
    position: new THREE.Vector3(1.0, 0.0, 0.0),
    lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
  };
  static RENDERER_PARAM = {
    clearColor: 0x000000,
    width: window.innerWidth,
    height: window.innerHeight,
  };
  static MATERIAL_PARAM = {
    color: 0x555555,
  };
  static BOX_PARAM = {
    count: 100,
  };

  renderer: THREE.WebGLRenderer;
  composer: EffectComposer;
  renderPass: RenderPass;
  bloomPass: UnrealBloomPass;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  ambientLight: THREE.AmbientLight;
  controls: OrbitControls;
  geometry: THREE.BoxGeometry;
  material: THREE.MeshNormalMaterial;
  blueMaterial: THREE.MeshStandardMaterial;
  redMaterial: THREE.MeshStandardMaterial;
  yellowMaterial: THREE.MeshStandardMaterial;
  greenMaterial: THREE.MeshStandardMaterial;
  pane: Pane;
  fan: THREE.Group;
  base: THREE.Mesh;
  fanHead: THREE.Group;
  pole: THREE.Mesh;
  blades: THREE.Group;
  hub: THREE.Mesh;
  clock: THREE.Clock;

  constructor(wrapper: HTMLDivElement) {
    const color = new THREE.Color(ThreeApp.RENDERER_PARAM.clearColor);
    this.pane = new Pane();
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(color);
    this.renderer.setSize(
      ThreeApp.RENDERER_PARAM.width,
      ThreeApp.RENDERER_PARAM.height,
    );
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    wrapper.appendChild(this.renderer.domElement);

    this.composer = new EffectComposer(this.renderer);

    this.scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.OrthographicCamera(
      -1.0 * aspect,
      1.0 * aspect,
      1.0,
      -1.0,
    );
    this.camera.position.copy(ThreeApp.CAMERA_PARAM.position);
    this.camera.lookAt(ThreeApp.CAMERA_PARAM.lookAt);

    this.renderPass = new RenderPass(this.scene, this.camera);
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.0,
      1.5,
      0.25,
    );
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.bloomPass);

    this.clock = new THREE.Clock();

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    this.scene.add(this.ambientLight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    this.geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
    this.material = new THREE.MeshNormalMaterial();
    this.material.side = THREE.DoubleSide;

    this.blueMaterial = new THREE.MeshStandardMaterial({
      color: 0x2437e0,
    });
    this.redMaterial = new THREE.MeshStandardMaterial({
      color: 0xc2120e,
    });
    this.yellowMaterial = new THREE.MeshStandardMaterial({
      color: 0xb8aa00,
    });
    this.greenMaterial = new THREE.MeshStandardMaterial({
      color: 0x118534,
    });

    this.fan = new THREE.Group();
    this.fan.position.y = -0.6;
    this.fan.scale.set(1.5, 1.5, 1.5);
    this.scene.add(this.fan);

    this.base = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.02, 0.5),
      this.material,
    );
    this.base.position.z = -0.04;
    this.fan.add(this.base);

    this.pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.6),
      this.material,
    );
    this.pole.position.y = 0.3;
    this.pole.position.z = -0.03;
    this.pole.rotation.x = -(Math.PI / 20);
    this.fan.add(this.pole);

    /**
     * FanHead
     */
    this.fanHead = new THREE.Group();
    this.fanHead.position.y = 0.6;
    this.fanHead.position.z = -0.075;
    this.fan.add(this.fanHead);

    const torusCount = 30;
    const torusGeometry = new THREE.TorusGeometry(0.25, 0.001, 16, 64);
    for (let i = 0; i < torusCount; i++) {
      const torusMesh = new THREE.Mesh(torusGeometry, this.material);
      torusMesh.rotation.x = (i * 2 * Math.PI) / torusCount;
      torusMesh.position.z = 0.08;
      this.fanHead.add(torusMesh);
    }

    const mortor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.15),
      this.material,
    );
    mortor.rotation.x = Math.PI / 2;
    this.fanHead.add(mortor);

    /**
     * Blades
     */
    this.blades = new THREE.Group();

    const bladeShape = new THREE.Shape();

    bladeShape.moveTo(0.0, 0.0);
    bladeShape.lineTo(0.0, -0.05);
    bladeShape.lineTo(0.15, -0.15);
    bladeShape.lineTo(0.15, 0.025);
    bladeShape.lineTo(0, 0);

    const bladeGeometry = new THREE.ShapeGeometry(bladeShape);

    for (let i = 0; i < 5; i++) {
      const bladeMesh = new THREE.Mesh(bladeGeometry, this.material);

      bladeMesh.position.x = Math.cos((i * 2 * Math.PI) / 5) * 0.05;
      bladeMesh.position.y = Math.sin((i * 2 * Math.PI) / 5) * 0.05;
      bladeMesh.position.z = 0.01;
      bladeMesh.rotation.z = (i * 2 * Math.PI) / 5;

      this.blades.add(bladeMesh);
    }

    this.hub = new THREE.Mesh(
      // new THREE.CylinderGeometry(0.075, 0.075, 0.04),
      new THREE.SphereGeometry(0.075, 16, 16),
      this.material,
    );
    this.hub.rotation.x = Math.PI / 2;
    this.blades.add(this.hub);

    this.blades.position.z = 0.085;
    this.fanHead.add(this.blades);

    this.setupTweakpane();

    window.addEventListener(
      'resize',
      () => {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.left = -1.0 * (window.innerWidth / window.innerHeight);
        this.camera.right = 1.0 * (window.innerWidth / window.innerHeight);
        this.camera.top = 1.0;
        this.camera.bottom = -1.0;
        this.camera.updateProjectionMatrix();
      },
      false,
    );
  }

  render = () => {
    const elapsedTime = this.clock.getElapsedTime();

    requestAnimationFrame(this.render);

    // Rotate fanHead
    this.fanHead.rotation.y = Math.sin(elapsedTime * 0.5);

    // Rotate blades
    this.blades.rotation.z = -(elapsedTime * 10);

    this.controls.update();
    this.composer.render();
  };

  setupTweakpane = () => {
    this.pane
      .addBinding(ThreeApp.RENDERER_PARAM, 'clearColor', {
        view: 'color',
      })
      .on('change', (e) => {
        this.renderer.setClearColor(e.value);
      });
  };
}
