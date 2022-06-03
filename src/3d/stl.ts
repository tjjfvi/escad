import { exportTypeRegistry, Hash, Id } from "../core/mod.ts";
import { Face } from "./Face.ts";
import { Mesh } from "./Mesh.ts";

exportTypeRegistry.register<Mesh>({
  type: "ExportType",
  id: Id.create(
    import.meta.url,
    "@escad/3d",
    "ExportType",
    "MeshBinaryStl",
  ),
  name: "Binary STL",
  extension: ".stl",
  productType: Mesh,
  export: async (meshes) => {
    const triangles = meshes.flatMap((m) =>
      m.faces.flatMap((f) => Face.toTriangles(f))
    );
    const buffer = new ArrayBuffer(84 + triangles.length * 50);
    new TextEncoder().encodeInto(
      "@escad/3d/stl/" + Hash.create(meshes),
      new Uint8Array(buffer),
    );
    let dataView = new DataView(buffer);
    dataView.setUint32(triangles.length, 80, true);
    let position = 84;
    for (const triangle of triangles) {
      for (const vector of [triangle.plane.normal, ...triangle.points]) {
        dataView.setFloat32(vector.x, position, true);
        dataView.setFloat32(vector.y, position + 4, true);
        dataView.setFloat32(vector.z, position + 8, true);
        position += 12;
      }
      position += 2;
    }
    return new Uint8Array(buffer);
  },
});

exportTypeRegistry.register<Mesh>({
  type: "ExportType",
  id: Id.create(
    import.meta.url,
    "@escad/3d",
    "ExportType",
    "MeshAsciiStl",
  ),
  name: "ASCII STL",
  extension: ".stl",
  productType: Mesh,
  export: async (meshes) => {
    const triangles = meshes.flatMap((m) =>
      m.faces.flatMap((f) => Face.toTriangles(f))
    );
    const name = `@escad/3d/stl/${Hash.create(meshes)}`;
    let str = "";
    str += `solid ${name}\n`;
    for (const triangle of triangles) {
      str +=
        `facet normal ${triangle.plane.normal.x} ${triangle.plane.normal.y} ${triangle.plane.normal.z}\n`;
      str += "outer loop\n";
      for (const vertex of triangle.points) {
        str += `vertex ${vertex.x} ${vertex.y} ${vertex.z}\n`;
      }
      str += "endloop\n";
      str += "endfacet\n";
    }
    str += `endsolid ${name}\n`;
    return new TextEncoder().encode(str);
  },
});
