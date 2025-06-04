import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Pane } from 'tweakpane';

export class ThreeApp {
  static CAMERA_PARAM = {
    fovy: 60,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 10.0,
    position: new THREE.Vector3(1.0, 1.5, 2.0),
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
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  directionalLight: THREE.DirectionalLight;
  ambientLight: THREE.AmbientLight;
  controls: OrbitControls;
  geometry: THREE.BoxGeometry;
  material: THREE.MeshStandardMaterial;
  pane: Pane;
  fan: THREE.Group;
  base: THREE.Mesh;
  fanHead: THREE.Group;
  pole: THREE.Mesh;
  blades: THREE.Group;
  hub: THREE.Mesh;

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

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    this.directionalLight.position.set(1.0, 1.0, 1.0);
    this.scene.add(this.directionalLight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    this.geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
    this.material = new THREE.MeshStandardMaterial(ThreeApp.MATERIAL_PARAM);
    this.material.side = THREE.DoubleSide;

    this.fan = new THREE.Group();
    this.fan.position.y = -0.3;
    this.scene.add(this.fan);

    this.base = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.05, 0.4),
      this.material,
    );
    this.fan.add(this.base);

    /**
     * FanHead
     */
    this.fanHead = new THREE.Group();
    this.fan.add(this.fanHead);

    this.pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.6),
      this.material,
    );
    this.fanHead.position.y = 0.3;
    this.fanHead.add(this.pole);

    const mortor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.15),
      this.material,
    );
    mortor.position.y = 0.3;
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

    for (let i = 0; i < 3; i++) {
      const bladeMesh = new THREE.Mesh(bladeGeometry, this.material);

      bladeMesh.position.x = Math.cos((i * 2 * Math.PI) / 3) * 0.05;
      bladeMesh.position.y = Math.sin((i * 2 * Math.PI) / 3) * 0.05;
      bladeMesh.position.z = 0.01;
      bladeMesh.rotation.z = (i * 2 * Math.PI) / 3;

      this.blades.add(bladeMesh);
    }

    this.hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.075, 0.04),
      this.material,
    );
    this.hub.rotation.x = Math.PI / 2;
    this.blades.add(this.hub);

    this.blades.position.y = 0.3;
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
    requestAnimationFrame(this.render);

    // Rotate fanHead
    this.fanHead.rotation.y += 0.01;

    // Rotate blades
    this.blades.rotation.z += 0.1;

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  setupTweakpane = () => {
    this.pane
      .addBinding(ThreeApp.RENDERER_PARAM, 'clearColor', {
        view: 'color',
      })
      .on('change', (e) => {
        this.renderer.setClearColor(e.value);
      });

    this.pane
      .addBinding(ThreeApp.MATERIAL_PARAM, 'color', {
        view: 'color',
      })
      .on('change', (e) => {
        this.material.color.set(e.value);
      });
  };
}
