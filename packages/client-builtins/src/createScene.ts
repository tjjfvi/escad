
import * as t from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { colors } from "./colors";
import { createOrientCube } from "./orientCube";
import { createLineAxes, createCylAxes } from "./axes";

export const createScene = () => {
  const scene = new t.Scene();
  const camera = new t.PerspectiveCamera(60, 1, 1e-2, 1e5);
  const orthocamera = new t.OrthographicCamera(-1, 1, 1, -1, 1e-2, 1e5);
  const renderer = new t.WebGLRenderer({ antialias: true });

  camera.position.set(-10, -20, 20);
  camera.up = new t.Vector3(0, 0, 1);
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableKeys = false;
  controls.screenSpacePanning = true;

  const centerSphere = new t.Mesh(new t.SphereBufferGeometry(1, 100, 100), new t.MeshBasicMaterial({
    color: colors.grey,
    transparent: true,
    opacity: .5,
    depthWrite: false,
  }));
  scene.add(centerSphere);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = t.PCFShadowMap;
  renderer.setSize(window.innerWidth, window.innerHeight);

  scene.background = new t.Color(colors.black);

  const inputGroup = new t.Group();

  scene.add(inputGroup);

  const orientScene = new t.Scene();
  const orientCamera = new t.PerspectiveCamera(60, 1, .1, 1000);
  const orientOrthocamera = new t.OrthographicCamera(-.5, .5, .5, -.5, .1, 1000);
  const orientRenderer = new t.WebGLRenderer({ antialias: true, alpha: true });
  const orientMouse = new t.Vector2(-1000, -1000);
  orientRenderer.setSize(200, 200);
  orientCamera.position.set(0, 0, 1);
  orientCamera.up = new t.Vector3(0, 0, 1);
  orientCamera.lookAt(0, 0, 0);
  const [orientCube, orientRaycast] = createOrientCube(() => ortho ? orientOrthocamera : orientCamera, controls);
  orientScene.add(orientCube);

  scene.add(...createLineAxes());
  orientScene.add(...createCylAxes());

  let ortho = false;

  return {
    scene,
    camera,
    orthocamera,
    renderer,
    controls,
    centerSphere,
    inputGroup,
    orientScene,
    orientCamera,
    orientOrthocamera,
    orientRenderer,
    orientMouse,
    orientCube,
    orientRaycast,
    ortho,
  };
}
