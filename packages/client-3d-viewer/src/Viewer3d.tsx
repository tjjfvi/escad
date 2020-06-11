/* eslint-disable react/prop-types */

import React from "react";
import { ViewerInput, Viewer } from "@escad/client";
// eslint-disable-next-line @typescript-eslint/no-var-requires
import * as t from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { colors } from "./colors";
import { createOrientCube } from "./orientCube";
import { createLineAxes, createCylAxes } from "./axes";

export interface Viewer3dInput extends ViewerInput {
  group: t.Group,
}

export const viewer3d: Viewer<Viewer3dInput> = {
  name: "3D",
  className: "3d",
  component: ({ inputs }) => {
    let el: any;

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
    inputGroup.add(...inputs.map(i => i.group));
    console.log(inputGroup, inputs);

    scene.add(inputGroup);

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

    scene.add(...createLineAxes());
    orientScene.add(...createCylAxes());

    let ortho = false;

    console.log(scene);

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

    return <div className="Viewer3d" ref={e => {
      el = e;
      el.appendChild(renderer.domElement);
      el.appendChild(orientRenderer.domElement);
      let handle = (e: any) => {
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
      orientRenderer.domElement.addEventListener("contextmenu", (e: any) => {
        ortho = !ortho;
        e.preventDefault();
      })
      let raycaster = new t.Raycaster();
      let mouse = new t.Vector2();
      let sphere = new t.Mesh(new t.SphereBufferGeometry(1, 100, 100), new t.MeshNormalMaterial());
      renderer.domElement.addEventListener("dblclick", (e: any) => {
        let cam = ortho ? orthocamera : camera;
        sphere.scale.set(1, 1, 1).multiplyScalar(cam.position.length() / 100)
        let cel = renderer.domElement;
        let rect = cel.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
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
}
