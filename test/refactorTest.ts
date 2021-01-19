
import "../packages/csg/register";
import { cube } from "../packages/solids/dist";
// import { Mesh, Vector3 } from "../packages/mesh/dist";
// import { writeFile } from "fs-extra";

// import { artifactManager, conversionRegistry, FsArtifactStore } from "../packages/core/dist";

// const stlVector = (v: Vector3) => `${v.x} ${v.y} ${v.z}`
// const stl = (mesh: Mesh) =>
//   "solid test\n" +
//   (mesh.faces.flatMap(face => [
//     `  facet normal ${stlVector(face.plane.normal)}`,
//     `    outer loop`,
//     `      vertex ${stlVector(face.points[0])}`,
//     `      vertex ${stlVector(face.points[1])}`,
//     `      vertex ${stlVector(face.points[2])}`,
//     `    endloop`,
//     `  endfacet`,
//   ]).join("\n")) +
//   "\nendsolid test";

// (async () => {
//   artifactManager.artifactStores.unshift(new FsArtifactStore(__dirname + "/../artifacts"));
//   // const x = Mesh.convert(model().toArrayFlat()[0]);
//   const x = await artifactManager.lookupRef([
//     conversionRegistry.artifactStoreId,
//     Mesh.id,
//     model().toArrayFlat()[0],
//   ]) as Mesh
//   await writeFile(__dirname + "/test.stl", stl(x), "utf8");
// })()

export default () => (
  cube({ s: 1 })
    .sub(cube({ s: .75 }))
    .sub(cube({ s: 1, c: false }))
)
