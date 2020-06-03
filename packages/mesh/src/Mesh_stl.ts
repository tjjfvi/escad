
import { ExportType, Id, Product } from "@escad/core";
import { Mesh } from "./Mesh";

const stl = new ExportType<Mesh>({
  id: new Id("Mesh-STL", __filename),
  name: "Binary STL",
  extension: ".stl",
  export: (mesh) => {
    const length = mesh.faces.length * 50 + 84;
    const buf = Buffer.alloc(length);
    buf.fill(mesh.sha.b64.padEnd(80));
    buf.writeUInt32LE(mesh.faces.length, 80);
    mesh.faces.forEach((f, i) => {
      buf.fill(f.plane.normal.serialize(), 84 + i * 50);
      buf.fill(f.serialize(), 84 + i * 50 + 12);
    })
    return buf;
  }
})

ExportType.Registry.register(Mesh, stl);
