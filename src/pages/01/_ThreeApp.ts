import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Pane } from 'tweakpane';

export class ThreeApp {
  static CAMERA_PARAM = {
    fovy: 60,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 10.0,
    position: new THREE.Vector3(0.0, 0.0, 1.0),
    lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
  };
  static RENDERER_PARAM = {
    clearColor: 0x000000,
    width: window.innerWidth,
    height: window.innerHeight,
  };
  static MATERIAL_PARAM = {
    color: 0x555555,
    wireframe: true,
  };
  static BOX_PARAM = {
    count: 100,
  };

  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  geometry: THREE.BoxGeometry;
  material: THREE.MeshBasicMaterial;
  boxArray: THREE.Mesh[];
  pane: Pane;

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
    this.camera = new THREE.PerspectiveCamera(
      ThreeApp.CAMERA_PARAM.fovy,
      ThreeApp.CAMERA_PARAM.aspect,
      ThreeApp.CAMERA_PARAM.near,
      ThreeApp.CAMERA_PARAM.far,
    );
    this.camera.position.copy(ThreeApp.CAMERA_PARAM.position);
    this.camera.lookAt(ThreeApp.CAMERA_PARAM.lookAt);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    this.geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
    this.material = new THREE.MeshBasicMaterial(ThreeApp.MATERIAL_PARAM);
    this.material.wireframe = ThreeApp.MATERIAL_PARAM.wireframe;

    this.boxArray = [];
    for (let i = 0; i < ThreeApp.BOX_PARAM.count; i++) {
      const box = new THREE.Mesh(this.geometry, this.material);
      this.scene.add(box);
      this.boxArray.push(box);
    }

    this.setupTweakpane();

    window.addEventListener(
      'resize',
      () => {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
      },
      false,
    );
  }

  render = () => {
    requestAnimationFrame(this.render);
    this.boxArray.forEach((box, i, array) => {
      box.rotation.z += (Math.PI / 2 / array.length) * (i + 1) * 0.01;
      box.rotation.x = Math.sin((Math.PI / array.length) * i);
      box.rotation.y = Math.cos((Math.PI / array.length) * i);
    });
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  setupTweakpane = () => {
    this.pane
      .addBinding(ThreeApp.RENDERER_PARAM, 'clearColor', {
        view: 'color',
      })
      .on('change', (ev) => {
        this.renderer.setClearColor(ev.value);
      });

    this.pane
      .addBinding(ThreeApp.MATERIAL_PARAM, 'color', {
        view: 'color',
      })
      .on('change', (ev) => {
        this.material.color.set(ev.value);
      });

    this.pane
      .addBinding(ThreeApp.BOX_PARAM, 'count', {
        min: 1,
        max: 500,
        step: 1,
      })
      .on('change', (ev) => {
        this.boxArray.forEach((box) => {
          this.scene.remove(box);
        });

        this.boxArray = [];

        for (let i = 0; i < ev.value; i++) {
          const box = new THREE.Mesh(this.geometry, this.material);
          this.scene.add(box);
          this.boxArray.push(box);
        }
      });
  };
}
