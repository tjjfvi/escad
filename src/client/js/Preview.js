
import React from "react";
import state from "./State";
const three = require("three");
console.log(three);
window.THREE = three;
require("three/examples/js/controls/OrbitControls");

const t = three;

const Preview = () => {
  let el;

  const scene = new t.Scene();
  const camera = new t.PerspectiveCamera(60, window.innerWIdth / window.innerHeight, .1, 1000);
  const renderer = new t.WebGLRenderer({ antialias: true });

  camera.position.set(-10, -20, 20);
  camera.up = new t.Vector3(0, 0, 1);
  camera.lookAt(0, 0, 0);

  const controls = new t.OrbitControls(camera, renderer.domElement);
  controls;

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = t.PCFShadowMap;
  renderer.setSize(window.innerWidth, window.innerHeight);

  scene.background = new t.Color(0x151820);

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

  state.ws.on("message", (type, data) => {
    if(type !== "sha")
      return;
    data;
    // ...
  })

  function render(){
    requestAnimationFrame(render);

    let width = el.clientWidth;
    let height = el.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.render(scene, camera);
  }

  return <div className="Preview" ref={e => {
    el = e;
    el.appendChild(renderer.domElement);
    render();
  }}></div>;
}

export default Preview;
