/** @jsxImportSource solid */
// @style "./stylus/Viewer3d.styl"
import { createEffect, onCleanup } from "../../deps/solid.ts";
import { registerViewer } from "../../client/mod.ts";
import * as t from "../../deps/three.ts";
import { createScene } from "./createScene.ts";
import { Face, Mesh } from "../mod.ts";
import { colors } from "./colors.ts";
import { EdgesGeometry } from "./EdgesGeometry.ts";

const s = createScene();
const {
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
  orientRaycast,
  mouse,
  originSphere,
  raycaster,
} = s;

const Viewer3d = (props: { productPromises: Promise<Mesh>[] }) => () => {
  let active = true;

  inputGroup.remove(...inputGroup.children);
  props.productPromises.map(async (p) => {
    if (active) inputGroup.add(meshToGroup(await p));
  });

  const el = <div class="Viewer3d" /> as HTMLDivElement;
  el.appendChild(renderer.domElement);
  el.appendChild(orientRenderer.domElement);
  createEffect(async () => {
    onCleanup(() => active = false);
    while (active) {
      render(el);
      await new Promise((r) => requestAnimationFrame(r));
    }
  });
  return el;
};

registerViewer<Mesh>({
  name: "3D",
  productType: Mesh,
  weight: 1,
  component: Viewer3d,
});

orientRenderer.domElement.classList.add("orient");
renderer.domElement.addEventListener(
  "mousemove",
  onOrientRendererMousemove,
  false,
);
orientRenderer.domElement.addEventListener(
  "mousemove",
  onOrientRendererMousemove,
  false,
);
orientRenderer.domElement.addEventListener("click", onOrientRendererClick);
orientRenderer.domElement.addEventListener(
  "contextmenu",
  onOrientRendererRightClick,
);
renderer.domElement.addEventListener("dblclick", onRendererDoubleClick);

function onOrientRendererMousemove(event: MouseEvent) {
  let cel = orientRenderer.domElement;
  let rect = cel.getBoundingClientRect();
  orientMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  orientMouse.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
}

function onOrientRendererRightClick(event: MouseEvent) {
  s.ortho = !s.ortho;
  event.preventDefault();
}

function onRendererDoubleClick(event: MouseEvent) {
  let cam = s.ortho ? orthocamera : camera;
  originSphere.scale.set(1, 1, 1).multiplyScalar(
    camera.position.length() / 100,
  );
  originSphere.visible = true;
  originSphere.updateMatrixWorld();
  let cel = renderer.domElement;
  let rect = cel.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  raycaster.setFromCamera(mouse, cam);
  let hits = raycaster.intersectObjects([inputGroup, originSphere], true);
  originSphere.visible = false;
  for (let { object, point } of hits) {
    if (object.type !== "Mesh") {
      continue;
    }
    if (object === originSphere) {
      point.set(0, 0, 0);
    }
    camera.position.add(point).sub(controls.target);
    controls.target = point;
    break;
  }
}

function onOrientRendererClick() {
  orientRaycast(orientMouse)(camera);
}

function render(el: HTMLDivElement) {
  let width = el.clientWidth;
  let height = el.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  orthocamera.position
    .copy(camera.position)
    .sub(controls.target)
    .normalize()
    .multiplyScalar(10000)
    .add(controls.target);
  orthocamera.quaternion.copy(camera.quaternion);
  orthocamera.zoom = 1.73 /
    camera.position.clone().sub(controls.target).length();
  orthocamera.left = orthocamera.bottom * width / height;
  orthocamera.right = orthocamera.top * width / height;
  orthocamera.updateProjectionMatrix();

  centerSphere.position.copy(controls.target);
  centerSphere.scale.set(1, 1, 1).multiplyScalar(
    camera.position.clone().sub(controls.target).length() / 100,
  );

  renderer.setSize(width, height);
  renderer.render(scene, s.ortho ? orthocamera : camera);
  orientCamera.position.copy(camera.position).sub(controls.target).normalize();
  orientCamera.lookAt(0, 0, 0);
  orientOrthocamera.position.copy(orientCamera.position);
  orientOrthocamera.quaternion.copy(orientCamera.quaternion);
  orientRenderer.render(
    orientScene,
    s.ortho ? orientOrthocamera : orientCamera,
  );
  orientRaycast(orientMouse);
}

function meshToGroup(product: Mesh) {
  let arr = new Float32Array(function* () {
    for (const face of product.faces) {
      for (const triangle of Face.toTriangles(face)) {
        for (const vertex of triangle.points) {
          yield vertex.x;
          yield vertex.y;
          yield vertex.z;
        }
      }
    }
  }());
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
  });
  let lines = new t.LineSegments(
    // @ts-ignore
    new EdgesGeometry(geo),
    new t.LineBasicMaterial({ color: colors.white }),
  );
  let mesh = new t.Mesh(geo, mat);
  let inMesh = new t.Mesh(geo, inMat);
  let group = new t.Group();
  group.add(lines);
  group.add(mesh);
  group.add(inMesh);
  lines.visible = false;
  setTimeout(() => {
    lines.visible = true;
  }, 0);
  return group;
}
