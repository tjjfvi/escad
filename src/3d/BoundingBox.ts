import {
  Conversion,
  conversionRegistry,
  createLeafProductUtils,
  Id,
  LeafProduct,
} from "../core/mod.ts";
import { Cube } from "./chainables/mod.ts";
import { Vector3 } from "./Vector3.ts";

const boundingBoxId = Id.create(
  import.meta.url,
  "@escad/3d",
  "LeafProduct",
  "BoundingBox",
);

export interface BoundingBox extends LeafProduct {
  readonly type: typeof boundingBoxId;
  readonly min: Vector3;
  readonly max: Vector3;
  readonly size: Vector3;
  readonly center: Vector3;
}

export const BoundingBox = {
  id: boundingBoxId,
  create: (min: Vector3, max: Vector3): BoundingBox => ({
    type: boundingBoxId,
    min,
    max,
    center: Vector3.multiplyScalar(Vector3.add(min, max), .5),
    size: Vector3.subtract(max, min),
  }),
  fromVector3: (vector: Vector3) => BoundingBox.create(vector, vector),
  ...createLeafProductUtils<BoundingBox, "BoundingBox">(
    boundingBoxId,
    "BoundingBox",
  ),
};

declare global {
  namespace escad {
    interface ConversionsObj {
      "@escad/3d/BoundingBox": Conversion<BoundingBox, Cube>;
    }
  }
}

conversionRegistry.register({
  id: Id.create(
    import.meta.url,
    "@escad/3d",
    "Conversion",
    "BoundingBoxToCube",
  ),
  fromType: BoundingBox,
  toType: Cube,
  convert: async (boundingBox) =>
    Cube.create(boundingBox.size, boundingBox.center),
  weight: 1,
});
