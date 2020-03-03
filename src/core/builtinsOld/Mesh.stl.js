
import { Mesh } from "./Mesh";

Mesh.exportTypes[".stl"] = (sha, mesh) => Buffer.concat([
  Buffer.from(sha.padEnd(80), "utf8"),
  (x => (x.writeUInt32LE(mesh.faces.length), x))(Buffer.alloc(4)),
  ...mesh.faces.map(f => Buffer.concat([
    Buffer.alloc(12),
    f.serialize(),
    Buffer.alloc(2),
  ], 50))
], mesh.faces.length * 50 + 84);
