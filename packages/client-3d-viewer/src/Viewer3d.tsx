/* eslint-disable react/prop-types */

import React from "react";
import { ViewerInput, Viewer } from "@escad/client";
// eslint-disable-next-line @typescript-eslint/no-var-requires
import * as t from "three";
import { createScene } from "./createScene";

export interface Viewer3dInput extends ViewerInput {
  group: t.Group,
}

const s = createScene();

const Viewer3d = ({ inputs }: { inputs: Promise<Viewer3dInput>[] }) => {
  let el: HTMLDivElement | null = null;

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
  } = s;

  inputGroup.remove(...inputGroup.children);
  inputs.map(async i => inputGroup.add((await i).group));

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
    renderer.render(scene, s.ortho ? orthocamera : camera);
    orientCamera.position.copy(camera.position).sub(controls.target).normalize();
    orientCamera.lookAt(0, 0, 0);
    orientOrthocamera.position.copy(orientCamera.position);
    orientOrthocamera.quaternion.copy(orientCamera.quaternion);
    orientRenderer.render(orientScene, s.ortho ? orientOrthocamera : orientCamera);
    orientRaycast(orientMouse);
  }

  return <div className="Viewer3d" ref={newEl => {
    el = newEl;
    if(!el) return;

    el.appendChild(renderer.domElement);
    el.appendChild(orientRenderer.domElement);

    let handle = (event: MouseEvent) => {
      let cel = orientRenderer.domElement;
      let rect = cel.getBoundingClientRect();
      orientMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      orientMouse.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    };
    renderer.domElement.addEventListener("mousemove", handle, false)
    orientRenderer.domElement.addEventListener("mousemove", handle, false)

    orientRenderer.domElement.addEventListener("click", () => {
      orientRaycast(orientMouse)(camera);
    })

    orientRenderer.domElement.addEventListener("contextmenu", (event: MouseEvent) => {
      s.ortho = !s.ortho;
      event.preventDefault();
    })

    let raycaster = new t.Raycaster();
    let mouse = new t.Vector2();
    let sphere = new t.Mesh(new t.SphereBufferGeometry(1, 100, 100), new t.MeshNormalMaterial());
    sphere.visible = false;
    scene.add(sphere);
    renderer.domElement.addEventListener("dblclick", (event: MouseEvent) => {
      let cam = s.ortho ? orthocamera : camera;
      sphere.scale.set(1, 1, 1).multiplyScalar(cam.position.length() / 100)
      sphere.updateMatrixWorld();
      let cel = renderer.domElement;
      let rect = cel.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      raycaster.setFromCamera(mouse, cam);
      let hits = raycaster.intersectObjects([inputGroup, sphere], true);
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

export const viewer3d: Viewer<Viewer3dInput> = {
  name: "3D",
  className: "3d",
  component: Viewer3d,
}
