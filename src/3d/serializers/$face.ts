import { $array, registerType, Serializer } from "../../serial/mod.ts";
import { Face } from "../Face.ts";
import { $vector3 } from "./$vector3.ts";

const $points = $array($vector3);
export const $face = new Serializer<Face>({
  s: (face) => $points.s(face.points),
  *d() {
    const points = yield* $points.d();
    return Face.create(points);
  },
});

registerType(Face.id, $face);
