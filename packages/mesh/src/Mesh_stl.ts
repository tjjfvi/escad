
import { ExportType, Id } from "@escad/core";
import { Mesh } from "./Mesh";
import { concat, constLengthString, array, uint32LE, uint16LE } from "tszer";
import { Vector3 } from "./Vector3";
import { Face } from "./Face";

const stl = new ExportType<Mesh>({
  id: new Id("Mesh-STL", __filename),
  name: "Binary STL",
  extension: ".stl",
  export: concat(
    constLengthString(80),
    array(concat(
      Vector3.serializer(),
      Face.serializer(),
      uint16LE()
    ).map<Face>({
      serialize: face => [face.plane.normal, face, 0],
      deserialize: ([, face]) => face,
    }), uint32LE())
  ).map<Mesh>({
    serialize: mesh => [mesh.sha.hex.padEnd(80), mesh.faces],
    deserialize: ([, faces]) => new Mesh(faces).finish(),
  }).serialize
})

ExportType.Registry.register(Mesh, stl);
