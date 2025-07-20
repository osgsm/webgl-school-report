import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class ThreeApp {
  static CAMERA_PARAM = {
    fovy: 60,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 10.0,
    position: new THREE.Vector3(-1.0, 2.0, 2.5),
    lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
  };
  static RENDERER_PARAM = {
    clearColor: 0x000000,
    width: window.innerWidth,
    height: window.innerHeight,
  };
  static MATERIAL_PARAM = {
    color: 0x555555,
    wireframe: false,
    flatShading: true,
  };
  static BOX_PARAM = {
    count: 100,
  };
  static CONE_PARAM = {
    radius: 0.05,
    height: 0.2,
    segments: 32,
    position: new THREE.Vector3(0.0, 0.0, 0.0),
  };
  static AMBIENT_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: 0.2,
  };
  static DIRECTIONAL_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: 1.0,
    position: new THREE.Vector3(1.0, 1.0, 1.0),
  };

  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  sphereGeometry: THREE.SphereGeometry;
  coneGeometry: THREE.ConeGeometry;
  sphereMaterial: THREE.MeshStandardMaterial;
  coneMaterial: THREE.MeshNormalMaterial;
  ambientLight: THREE.AmbientLight;
  directionalLight: THREE.DirectionalLight;
  sphere: THREE.Mesh;
  cone: THREE.Mesh;
  clock: THREE.Clock;
  prevConePosition: THREE.Vector3;
  currentConePosition: THREE.Vector3;

  constructor(wrapper: HTMLDivElement) {
    const color = new THREE.Color(ThreeApp.RENDERER_PARAM.clearColor);
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

    this.ambientLight = new THREE.AmbientLight(
      ThreeApp.AMBIENT_LIGHT_PARAM.color,
      ThreeApp.AMBIENT_LIGHT_PARAM.intensity,
    );
    this.scene.add(this.ambientLight);
    this.directionalLight = new THREE.DirectionalLight(
      ThreeApp.DIRECTIONAL_LIGHT_PARAM.color,
      ThreeApp.DIRECTIONAL_LIGHT_PARAM.intensity,
    );
    this.directionalLight.position.set(
      ThreeApp.DIRECTIONAL_LIGHT_PARAM.position.x,
      ThreeApp.DIRECTIONAL_LIGHT_PARAM.position.y,
      ThreeApp.DIRECTIONAL_LIGHT_PARAM.position.z,
    );
    this.directionalLight.lookAt(ThreeApp.CAMERA_PARAM.lookAt);
    this.scene.add(this.directionalLight);

    this.sphereGeometry = new THREE.SphereGeometry();
    this.sphereMaterial = new THREE.MeshStandardMaterial(
      ThreeApp.MATERIAL_PARAM,
    );

    this.coneGeometry = new THREE.ConeGeometry(
      ThreeApp.CONE_PARAM.radius,
      ThreeApp.CONE_PARAM.height,
      ThreeApp.CONE_PARAM.segments,
    );
    this.coneMaterial = new THREE.MeshNormalMaterial(ThreeApp.MATERIAL_PARAM);

    this.sphere = new THREE.Mesh(this.sphereGeometry, this.sphereMaterial);
    this.scene.add(this.sphere);

    this.cone = new THREE.Mesh(this.coneGeometry, this.coneMaterial);
    this.prevConePosition = ThreeApp.CONE_PARAM.position.clone();
    this.currentConePosition = ThreeApp.CONE_PARAM.position.clone();
    this.cone.position.copy(this.prevConePosition);
    this.scene.add(this.cone);

    window.addEventListener(
      'resize',
      () => {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
      },
      false,
    );

    this.clock = new THREE.Clock();
  }

  render = () => {
    requestAnimationFrame(this.render);

    const nowTime = this.clock.getElapsedTime();

    this.currentConePosition.x = Math.cos(nowTime) * Math.cos(nowTime * 10);
    this.currentConePosition.y = Math.sin(nowTime * 8) * 1.1;
    this.currentConePosition.z = Math.cos(nowTime * 8) * 1.1;

    const direction = new THREE.Vector3().subVectors(
      this.currentConePosition,
      this.prevConePosition,
    );
    direction.normalize();

    const upVector = new THREE.Vector3(0, 1, 0);
    const rotationAxis = new THREE.Vector3().crossVectors(upVector, direction);
    rotationAxis.normalize();

    const angle = Math.acos(upVector.dot(direction));
    const qtn = new THREE.Quaternion().setFromAxisAngle(rotationAxis, angle);

    this.cone.quaternion.copy(qtn);
    this.cone.position.copy(this.currentConePosition);
    this.prevConePosition.copy(this.currentConePosition);

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };
}
