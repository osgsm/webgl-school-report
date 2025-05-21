import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class ThreeApp {
  static CAMERA_PARAM = {
    fovy: 60,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 10.0,
    position: new THREE.Vector3(0.0, 2.0, 5.0),
    lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
  };
  static RENDERER_PARAM = {
    clearColor: 0x333333,
    width: window.innerWidth,
    height: window.innerHeight,
  };
  static MATERIAL_PARAM = {
    color: 0x3399ff,
  };

  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  geometry: THREE.BoxGeometry;
  material: THREE.MeshBasicMaterial;
  box: THREE.Mesh;

  constructor(wrapper: HTMLDivElement) {
    const color = new THREE.Color(ThreeApp.RENDERER_PARAM.clearColor);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(color);
    this.renderer.setSize(
      ThreeApp.RENDERER_PARAM.width,
      ThreeApp.RENDERER_PARAM.height,
    );
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

    this.box = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.box);

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
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };
}
