import { viewerRegistry } from "../client/mod.ts";
import { Face, Mesh } from "../builtins/mod.ts";
import { viewer3d, Viewer3dInput } from "./Viewer3d.ts";
import { colors } from "./colors.ts";
import { EdgesGeometry } from "./EdgesGeometry.ts";
import * as t from "three.ts";

viewerRegistry.register<Mesh, Viewer3dInput>({
  type: Mesh,
  context: viewer3d,
  map: (product) => {
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
    // @ts-ignore
    let lines = new t.LineSegments(
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
    return {
      product,
      group,
    };
  },
});
