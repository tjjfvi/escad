
import "../packages/csg/register";
import { cube } from "../packages/solids/dist";
import { Mesh, Vector3 } from "../packages/mesh/dist";
import { writeFile } from "fs-extra";
import { ArtifactManager } from "../packages/csg/node_modules/@escad/core/src";
import { ReadonlyArtifactManager } from "../packages/mesh/node_modules/@escad/core/dist";

const stlVector = (v: Vector3) => `${v.x} ${v.y} ${v.z}`
const stl = (mesh: Mesh) =>
  "solid test\n" +
  (mesh.faces.flatMap(face => [
    `  facet normal ${stlVector(face.plane.normal)}`,
    `    outer loop`,
    `      vertex ${stlVector(face.points[0])}`,
    `      vertex ${stlVector(face.points[1])}`,
    `      vertex ${stlVector(face.points[2])}`,
    `    endloop`,
    `  endfacet`,
  ]).join("\n")) +
  "\nendsolid test";

(async () => {
  // let a = await Bsp.convert(cube({ s: 1 }).val);
  // let b = await Bsp.convert(cube({ s: 1, c: false }).val);
  // a = Bsp.invert(a);
  // a = Bsp.clipTo(a, b);
  // b = Bsp.clipTo(b, a);
  // b = Bsp.invert(b);
  // b = Bsp.clipTo(b, a);
  // b = Bsp.invert(b);
  // a = Bsp.build(a, Bsp.allFaces(b)) ?? Bsp.null();
  // a = Bsp.invert(a);
  // const x = await Mesh.convert(a);
  ReadonlyArtifactManager.setArtifactsDir(__dirname + "/../artifacts");
  console.log(ArtifactManager.artifactsDir);
  const x = await Mesh.convert(
    cube({ s: 1 })
      .sub(cube({ s: .9 }))
      .sub(cube({ s: .5, c: false }))
      .toArrayFlat()[0]
  )
  await writeFile(__dirname + "/test.stl", stl(x), "utf8");
})()

// cube({ s: 1 })
//   .add(cube({ s: 1, c: false }))
//   .toArrayFlat()
//   .map(async product => {
//     console.log(product);
//     const fv = (v: Vector3) => `${v.x} ${v.y} ${v.z}`
//     const x = await Mesh.convert(product);
//     console.log(x);
//     console.log(x.faces.length);
//     console.log("solid test")
//     console.log(x.faces.flatMap(f => [
//       `facet normal ${fv(f.plane.normal)}`,
//       `outer loop`,
//       `vertex ${fv(f.points[0])}`,
//       `vertex ${fv(f.points[1])}`,
//       `vertex ${fv(f.points[2])}`,
//       `endloop`,
//       `endfacet`,
//     ]).join("\n"));
//     console.log("endsolid test")
//   })
