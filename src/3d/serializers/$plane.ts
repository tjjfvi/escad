import { $number, registerType, Serializer } from "../../serial/mod.ts";
import { Plane } from "../Plane.ts";
import { $vector3 } from "./$vector3.ts";

export const $plane = new Serializer<Plane>({
  *s(plane) {
    yield* $vector3.s(plane.normal);
    yield* $number.s(plane.w);
  },
  *d() {
    const normal = yield* $vector3.d();
    const w = yield* $number.d();
    return Plane.create(normal, w);
  },
});

registerType(Plane.id, $plane);
