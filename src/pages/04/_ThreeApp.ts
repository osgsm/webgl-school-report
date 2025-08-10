import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'gsap';

export class ThreeApp {
  static CAMERA_PARAM = {
    fovy: 45,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 20.0,
    position: new THREE.Vector3(0.0, 0.0, 0.1),
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
  static HORIZONTAL_PLANE_PARAM = {
    width: 1.0,
    height: 0.75,
  };
  static VERTICAL_PLANE_PARAM = {
    width: 0.75,
    height: 1.0,
  };
  static AMBIENT_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: 35.0,
  };
  static DIRECTIONAL_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: 10.0,
    position: new THREE.Vector3(1.0, 1.0, 1.0),
  };

  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  sphereGeometry: THREE.SphereGeometry;
  sphereMaterial: THREE.MeshStandardMaterial;
  planes: THREE.Mesh[];
  ambientLight: THREE.AmbientLight;
  directionalLight: THREE.DirectionalLight;
  sphere: THREE.Mesh;
  clock: THREE.Clock;
  textureLoader: THREE.TextureLoader;
  textures: THREE.Texture[];
  planeMaterials: THREE.MeshStandardMaterial[];
  planeGeometries: THREE.PlaneGeometry[];
  mouse: THREE.Vector2;
  raycaster: THREE.Raycaster;

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
    this.controls.enablePan = false;
    this.controls.enableZoom = false;

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

    this.sphereGeometry = new THREE.SphereGeometry();
    this.sphereMaterial = new THREE.MeshStandardMaterial(
      ThreeApp.MATERIAL_PARAM,
    );

    this.sphere = new THREE.Mesh(this.sphereGeometry, this.sphereMaterial);

    this.textures = [];
    this.planeMaterials = [];
    this.planeGeometries = [];

    const texturePaths = [
      '/images/04-01.jpg',
      '/images/04-02.jpg',
      '/images/04-03.jpg',
      '/images/04-04.jpg',
      '/images/04-05.jpg',
      '/images/04-06.jpg',
      '/images/04-07.jpg',
      '/images/04-08.jpg',
    ];

    this.textureLoader = new THREE.TextureLoader();

    const loadPromises = texturePaths.map((path) => {
      return new Promise<THREE.Texture>((resolve) => {
        this.textureLoader.load(path, (loadedTexture) => {
          loadedTexture.colorSpace = THREE.SRGBColorSpace;
          resolve(loadedTexture);
        });
      });
    });

    Promise.all(loadPromises).then((loadedTextures) => {
      loadedTextures.forEach((texture) => {
        this.textures.push(texture);

        const aspectRatio = texture.image.width / texture.image.height;
        const baseSize = 1.0;

        let width, height;
        if (aspectRatio > 1) {
          width = baseSize * aspectRatio;
          height = baseSize;
        } else {
          width = baseSize;
          height = baseSize / aspectRatio;
        }

        const geometry = new THREE.PlaneGeometry(width, height);
        this.planeGeometries.push(geometry);

        const material = new THREE.MeshStandardMaterial(
          ThreeApp.MATERIAL_PARAM,
        );
        material.map = texture;
        material.side = THREE.DoubleSide;
        material.transparent = true;
        material.needsUpdate = true;
        this.planeMaterials.push(material);
      });

      this.createPlanes();
    });

    this.planes = [];

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

    this.mouse = new THREE.Vector2();

    window.addEventListener('mousemove', (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    this.raycaster = new THREE.Raycaster();

    window.addEventListener('click', () => {
      this.raycaster.setFromCamera(this.mouse, this.camera);

      const intersects = this.raycaster.intersectObjects(this.planes);
      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh;
        location.href = mesh.material.map.source.data.currentSrc;
      }
    });
  }

  createPlanes() {
    const counts = 33;

    for (let i = 0; i < counts; i++) {
      const materialIndex = i % this.planeMaterials.length;
      const geometryIndex = i % this.planeGeometries.length;

      const plane = new THREE.Mesh(
        this.planeGeometries[geometryIndex],
        this.planeMaterials[materialIndex],
      );

      const phi = Math.acos(-1.0 + (2.0 * i) / counts);
      const theta = Math.sqrt(counts * Math.PI) * phi;

      plane.position.setFromSphericalCoords(3.0, phi, theta);

      plane.lookAt(ThreeApp.CAMERA_PARAM.position);
      this.scene.add(plane);
      this.planes.push(plane);
    }
  }

  render = () => {
    requestAnimationFrame(this.render);

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const objectsToTest = this.planes;
    const intersects = this.raycaster.intersectObjects(objectsToTest);

    if (intersects.length > 0) {
      const mesh = intersects[0].object as THREE.Mesh;
      const material = mesh.material as THREE.MeshBasicMaterial;
      material.transparent = false;

      gsap.to(material, {
        opacity: 1.0,
        duration: 0.3,
        ease: 'power2.out',
      });
    }

    for (const intersect of intersects) {
      const mesh = intersect.object as THREE.Mesh;

      gsap.to(mesh.scale, {
        x: 1.25,
        y: 1.25,
        z: 1.25,
        duration: 0.3,
        ease: 'power2.out',
      });
    }

    for (const object of objectsToTest) {
      if (!intersects.find((intersect) => intersect.object === object)) {
        gsap.to(object.scale, {
          x: 1.0,
          y: 1.0,
          z: 1.0,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };
}
