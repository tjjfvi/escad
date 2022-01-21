import { registerType, Serializer } from "../serial/mod.ts";
import { BoundingBox } from "../BoundingBox.ts";
import { $vector3 } from "./$vector3.ts";

export const $boundingBox = new Serializer<BoundingBox>({
  *s(box) {
    yield* $vector3.s(box.min);
    yield* $vector3.s(box.max);
  },
  *d() {
    const min = yield* $vector3.d();
    const max = yield* $vector3.d();
    return BoundingBox.create(min, max);
  },
});

registerType(BoundingBox.id, $boundingBox);
