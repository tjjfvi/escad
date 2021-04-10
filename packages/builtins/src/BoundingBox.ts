
import { Conversion, conversionRegistry, createLeafProductUtils, Id, LeafProduct } from "@escad/core"
import { Cube } from "./cube"
import { Vector3 } from "./Vector3"

const boundingBoxId = Id.create(__filename, "@escad/builtins", "LeafProduct", "BoundingBox", "0")

export interface BoundingBox extends LeafProduct {
  readonly type: typeof boundingBoxId,
  readonly min: Vector3,
  readonly max: Vector3,
  readonly size: Vector3,
  readonly center: Vector3,
}

export const BoundingBox = {
  create: (min: Vector3, max: Vector3): BoundingBox => ({
    type: boundingBoxId,
    min,
    max,
    center: Vector3.multiplyScalar(Vector3.add(min, max), .5),
    size: Vector3.subtract(max, min),
  }),
  ...createLeafProductUtils<BoundingBox, "BoundingBox">(boundingBoxId, "BoundingBox"),
}

declare global {
  namespace escad {
    interface ConversionsObj {
      "@escad/builtins/BoundingBox": (
        | Conversion<BoundingBox, Cube>
      ),
    }
  }
}

conversionRegistry.register({
  id: Id.create(__filename, "@escad/builtins", "Conversion", "BoundingBoxToCube", "0"),
  fromType: BoundingBox,
  toType: Cube,
  convert: async boundingBox =>
    Cube.create(boundingBox.size, boundingBox.center),
  weight: 1,
})
