
import * as t from "three";

const axesData = [
  [new t.Vector3(+1, 0, 0), 0xe74c3c, 1],
  [new t.Vector3(-1, 0, 0), 0xe74c3c, .5],
  [new t.Vector3(0, +1, 0), 0x2ecc71, 1],
  [new t.Vector3(0, -1, 0), 0x2ecc71, .5],
  [new t.Vector3(0, 0, +1), 0x3498db, 1],
  [new t.Vector3(0, 0, -1), 0x3498db, .5],
] as const;

export const createLineAxes = () =>
  axesData.map(([vector, color, opacity]) => {
    let geo = new t.Geometry();
    geo.vertices.push(
      new t.Vector3(),
      vector.clone().multiplyScalar(1e10),
    );

    let mat = new t.LineBasicMaterial({ color, transparent: true, opacity });

    return new t.Line(geo, mat);
  })

export const createCylAxes = (radius = .01, length = .3) =>
  axesData.map(([vector, color, opacity = 1]) => {
    let geo = new t.CylinderBufferGeometry(radius, radius, length, 100, 1, false).translate(0, .15, 0);
    let mat = new t.MeshBasicMaterial({ color, transparent: true, opacity });
    let mesh = new t.Mesh(geo, mat);
    mesh.quaternion.setFromUnitVectors(new t.Vector3(0, 1, 0), vector);
    return mesh;
  })
