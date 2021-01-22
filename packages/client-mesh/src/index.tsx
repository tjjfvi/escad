
import { registerViewerRegistration } from "@escad/client";
import { viewer3d, colors, EdgesGeometry, Viewer3dInput } from "@escad/client-3d-viewer";
import { Mesh } from "@escad/mesh";
import * as t from "three";

registerViewerRegistration<Mesh, Viewer3dInput>({
  type: Mesh.productType,
  context: viewer3d,
  map: product => {
    let arr = new Float32Array(function*(){
      for(let face of product.faces)
        for(let vertex of face.points) {
          yield vertex.x;
          yield vertex.y;
          yield vertex.z;
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
    })
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let lines = new t.LineSegments(new EdgesGeometry(geo), new t.LineBasicMaterial({ color: colors.white }))
    let mesh = new t.Mesh(geo, mat);
    let inMesh = new t.Mesh(geo, inMat);
    let group = new t.Group();
    group.add(lines);
    group.add(mesh);
    group.add(inMesh);
    lines.visible = false;
    setTimeout(() => {
      lines.visible = true;
    }, 0)
    return {
      product,
      group,
    };
  }
})
