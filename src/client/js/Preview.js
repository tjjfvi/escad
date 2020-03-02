
const colors = {
  black:     0x151820,
  blackish:  0x1d2028,
  darkgrey:  0x252830,
  grey:      0x454850,
  lightgrey: 0x656870,
  white:     0xbdc3c7,
  red:       0xc0392b,
  orange:    0xd35400,
  yellow:    0xf1c40f,
  green:     0x2ecc71,
  blue:      0x0984e3,
  purple:    0x8e44ad,
};

import React from "react";
import state from "./State";
const three = require("three");
console.log(three);
window.THREE = three;
require("three/examples/js/controls/OrbitControls");
require("three/examples/js/utils/BufferGeometryUtils");
import { EdgesGeometry } from "./EdgesGeometry";

const t = three;

const Preview = () => {
  let el;

  const scene = new t.Scene();
  const camera = new t.PerspectiveCamera(60, 1, 1e-2, 1e5);
  const orthocamera = new t.OrthographicCamera(-1, 1, 1, -1, 1e-2, 1e5);
  const renderer = new t.WebGLRenderer({ antialias: true });

  camera.position.set(-10, -20, 20);
  camera.up = new t.Vector3(0, 0, 1);
  camera.lookAt(0, 0, 0);

  const controls = new t.OrbitControls(camera, renderer.domElement);
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

  const axes = [
    [new t.Vector3(+1, 0, 0), 0xe74c3c,  1],
    [new t.Vector3(-1, 0, 0), 0xe74c3c, .5],
    [new t.Vector3(0, +1, 0), 0x2ecc71,  1],
    [new t.Vector3(0, -1, 0), 0x2ecc71, .5],
    [new t.Vector3(0, 0, +1), 0x3498db,  1],
    [new t.Vector3(0, 0, -1), 0x3498db, .5],
  ].map(([vector, color, opacity = 1]) => {
    let geo = new t.Geometry();
    geo.vertices.push(
      new t.Vector3(),
      vector.multiplyScalar(1e10),
    );

    let mat = new t.LineBasicMaterial({ color, transparent: true, opacity });

    return new t.Line(geo, mat);
  })

  scene.add(...axes);

  const group = new t.Group();
  scene.add(group);

  state.shas.ee.on("change", async () => {
    let meshes = await Promise.all(state.shas().map(sha =>
      fetch("/products/" + sha).then(r => r.arrayBuffer()).then(processMesh))
    );
    group.remove(...group.children);
    group.add(...meshes);
  });

  const orientScene = new t.Scene();
  const orientCamera = new t.PerspectiveCamera(60, 1, .1, 1000);
  const orientOrthocamera = new t.OrthographicCamera(-.5, .5, .5, -.5, .1, 1000);
  const orientRenderer = new t.WebGLRenderer({ antialias: true, alpha: true });
  const orientMouse = new t.Vector2();
  orientRenderer.setSize(200, 200);
  orientCamera.position.set(0, 0, 1);
  orientCamera.up = new t.Vector3(0, 0, 1);
  orientCamera.lookAt(0, 0, 0);
  const [orientCube, orientRaycast] = createOrientCube(() => ortho ? orientOrthocamera : orientCamera, controls);
  orientScene.add(orientCube);

  const orientAxes = [
    [new t.Vector3(+1, 0, 0), 0xe74c3c,  1],
    [new t.Vector3(-1, 0, 0), 0xe74c3c, .5],
    [new t.Vector3(0, +1, 0), 0x2ecc71,  1],
    [new t.Vector3(0, -1, 0), 0x2ecc71, .5],
    [new t.Vector3(0, 0, +1), 0x3498db,  1],
    [new t.Vector3(0, 0, -1), 0x3498db, .5],
  ].map(([vector, color, opacity = 1]) => {
    let geo = new t.CylinderBufferGeometry(.01, .01, .3, 100, 1, false).translate(0, .15, 0);
    let mat = new t.MeshBasicMaterial({ color, transparent: true, opacity });
    let mesh = new t.Mesh(geo, mat);
    mesh.quaternion.setFromUnitVectors(new t.Vector3(0, 1, 0), vector);
    return mesh;
  })

  orientScene.add(...orientAxes);

  let ortho = false;

  function render(){
    if(!el)
      return;
    requestAnimationFrame(render);

    let width = el.clientWidth;
    let height = el.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    orthocamera.position
      .copy(camera.position)
      .sub(controls.target)
      .normalize()
      .multiplyScalar(10000)
      .add(controls.target)
    orthocamera.quaternion.copy(camera.quaternion);
    orthocamera.zoom = 1.73 / camera.position.clone().sub(controls.target).length();
    orthocamera.left = orthocamera.bottom * width / height;
    orthocamera.right = orthocamera.top * width / height;
    orthocamera.updateProjectionMatrix();

    centerSphere.position.copy(controls.target);
    centerSphere.scale.set(1, 1, 1).multiplyScalar(camera.position.clone().sub(controls.target).length() / 100)

    renderer.setSize(width, height);
    renderer.render(scene, ortho ? orthocamera : camera);
    orientCamera.position.copy(camera.position).sub(controls.target).normalize();
    orientCamera.lookAt(0, 0, 0);
    orientOrthocamera.position.copy(orientCamera.position);
    orientOrthocamera.quaternion.copy(orientCamera.quaternion);
    orientRenderer.render(orientScene, ortho ? orientOrthocamera : orientCamera);
    orientRaycast(orientMouse);
  }

  return <div className="Preview" ref={e => {
    el = e;
    el.appendChild(renderer.domElement);
    el.appendChild(orientRenderer.domElement);
    let handle = e => {
      let cel = orientRenderer.domElement;
      let rect = cel.getBoundingClientRect();
      orientMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      orientMouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    renderer.domElement.addEventListener("mousemove", handle, false)
    orientRenderer.domElement.addEventListener("mousemove", handle, false)
    orientRenderer.domElement.addEventListener("click", () => {
      orientRaycast(orientMouse)(camera);
    })
    orientRenderer.domElement.addEventListener("contextmenu", e => {
      ortho = !ortho;
      e.preventDefault();
    })
    let raycaster = new t.Raycaster();
    let mouse = new t.Vector2();
    let sphere = new t.Mesh(new t.SphereBufferGeometry(1, 100, 100), new t.MeshNormalMaterial());
    renderer.domElement.addEventListener("dblclick", e => {
      let cam = ortho ? orthocamera : camera;
      sphere.scale.set(1, 1, 1).multiplyScalar(cam.position.length() / 100)
      let cel = renderer.domElement;
      let rect = cel.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      raycaster.setFromCamera(mouse, cam);
      let hits = raycaster.intersectObjects([group, sphere], true);
      for(let { object, point } of hits) {
        if(object.type !== "Mesh")
          continue;
        if(object === sphere)
          point.set(0, 0, 0);
        camera.position.add(point).sub(controls.target);
        controls.target = point;
        break;
      }
    })
    orientRenderer.domElement.classList.add("orient");
    render();
  }}></div>;
}

export default Preview;

function processMesh(buf){
  let arr = new Float32Array(buf.slice(64));
  let attr = new t.BufferAttribute(arr, 3);
  let geo = new t.BufferGeometry();
  geo.setAttribute("position", attr);
  geo.computeVertexNormals();
  let mat = new t.MeshBasicMaterial({
    color: colors.darkgrey,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  let inMat = new t.MeshBasicMaterial({
    color: colors.red,
    side: t.BackSide,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  })
  let lines = new t.LineSegments(new EdgesGeometry(geo), new t.LineBasicMaterial({ color: colors.white }))
  let mesh = new t.Mesh(geo, mat);
  let inMesh = new t.Mesh(geo, inMat);
  let group = new t.Group();
  group.add(mesh, inMesh, lines);
  return group;
}

const cubeSize = .5;
const edgeSize = .125;
const centerSize = cubeSize - edgeSize * 2;

function createOrientCube(c, controls){
  let planeGeo = new t.PlaneBufferGeometry(centerSize, centerSize);

  let edgeGeo = t.BufferGeometryUtils.mergeBufferGeometries([
    new t.PlaneBufferGeometry(edgeSize, centerSize).translate(-edgeSize / 2, 0, 0),
    new t.PlaneBufferGeometry(edgeSize, centerSize).translate(edgeSize / 2, 0, 0).rotateY(Math.PI / 2),
  ]);

  let cornerGeo = t.BufferGeometryUtils.mergeBufferGeometries([
    new t.PlaneBufferGeometry(edgeSize, edgeSize).translate(-edgeSize / 2, -edgeSize / 2, 0),
    new t.PlaneBufferGeometry(edgeSize, edgeSize).translate(edgeSize / 2, -edgeSize / 2, 0).rotateY(Math.PI / 2),
    new t.PlaneBufferGeometry(edgeSize, edgeSize).translate(-edgeSize / 2, edgeSize / 2, 0).rotateX(-Math.PI / 2),
  ]);

  let mat = new t.MeshBasicMaterial({ color: colors.blackish });
  let hoverMat = new t.MeshBasicMaterial({ color: colors.grey });

  let sides = [
    new t.Vector3(1, 0, 0),
    new t.Vector3(0, 1, 0),
    new t.Vector3(0, 0, 1)
  ].flatMap(a => [a, a.clone().negate()].map(a => {
    let mesh = new t.Mesh(planeGeo, mat);
    mesh.position.copy(a).multiplyScalar(.25);
    mesh.lookAt(a);
    return mesh;
  }));

  let edges = [
    0,
    Math.PI / 2,
    Math.PI,
  ].flatMap(x => [0, Math.PI / 2, Math.PI, -Math.PI / 2].flatMap(z => {
    let mesh = new t.Mesh(edgeGeo, mat);
    mesh.rotateZ(z);
    mesh.rotateX(x);
    mesh.position.set(cubeSize / 2, 0, cubeSize / 2).applyQuaternion(mesh.quaternion);
    return mesh;
  }));

  let corners = [
    0,
    Math.PI,
  ].flatMap(x => [0, Math.PI / 2, Math.PI, -Math.PI / 2].flatMap(z => {
    let mesh = new t.Mesh(cornerGeo, mat);
    mesh.rotateZ(z);
    mesh.rotateX(x);
    mesh.position.set(cubeSize / 2, cubeSize / 2, cubeSize / 2).applyQuaternion(mesh.quaternion);
    return mesh;
  }));

  let parts = [sides, edges, corners].flat();

  let group = new t.Group();

  group.add(...parts);

  group.add(new t.LineSegments(
    new t.EdgesGeometry(new t.CubeGeometry(.5, .5, .5)),
    new t.LineBasicMaterial({ color: colors.lightgrey })
  ));

  let raycaster = new t.Raycaster();
  let lastCast;
  let raycast = mouse => {
    raycaster.setFromCamera(mouse, c());
    let x = raycaster.intersectObjects(parts);
    let [{ object: mesh } = {}] = x;
    if(lastCast)
      lastCast.material = mat;
    lastCast = mesh;
    if(!mesh)
      return () => {};
    mesh.material = hoverMat;
    return c => {
      let dist = c.position.distanceTo(controls.target);
      c.position
        .copy(mesh.position)
        .normalize()
        .multiplyScalar(dist)
        .add(controls.target)
      controls.update();
    }
  };

  return [group, raycast];
}
