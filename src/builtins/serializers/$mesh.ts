import { $array, registerType, Serializer } from "../serial/mod.ts";
import { Mesh } from "../Mesh.ts";
import { $face } from "./$face.ts";

const $faces = $array($face);
export const $mesh = new Serializer<Mesh>({
  s: (mesh) => $faces.s(mesh.faces),
  *d() {
    const faces = yield* $faces.d();
    return Mesh.create(faces);
  },
});

registerType(Mesh.id, $mesh);
