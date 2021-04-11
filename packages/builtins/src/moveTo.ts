import {
  Component,
  Conversion,
  conversionRegistry,
  ConvertibleTo,
  createLeafProductUtils,
  Id,
  LeafProduct,
  mapOperation,
  MarkedProduct,
  Product,
  Element,
  TupleProduct,
  TupleProductType,
} from "@escad/core"
import { BoundingBox } from "./BoundingBox"
import { getBoundingBox } from "./getBoundingBox"
import { Matrix4 } from "./Matrix4"
import { Mesh } from "./Mesh"
import { Transformation } from "./Transformation"

const moveToId = Id.create(__filename, "@escad/builtins", "Marker", "MoveTo", "0")
export type MoveTo<T extends Product> = MarkedProduct<typeof moveToId, T>
export const MoveTo = MarkedProduct.for(moveToId)

const moveToArgsId = Id.create(__filename, "@escad/builtins", "LeafProduct", "MoveToArgs", "0")

type Axis = "x" | "y" | "z"

export interface MoveToArgs extends LeafProduct {
  readonly type: typeof moveToArgsId,
  readonly axis: Axis,
  readonly toEdge: number,
  readonly shift: number,
}

export const MoveToArgs = {
  create: (axis: Axis, toEdge: number, shift: number): MoveToArgs => ({
    type: moveToArgsId,
    axis,
    toEdge,
    shift,
  }),
  id: moveToArgsId,
  ...createLeafProductUtils<MoveToArgs, "MoveToArgs">(moveToArgsId, "MoveToArgs"),
}

export const moveTo = Component.create(
  "moveTo",
  (target: Element<ConvertibleTo<Mesh>>, axis: "x" | "y" | "z", toEdge = 0, shift = 0) =>
    mapOperation(
      "moveTo",
      async (source: ConvertibleTo<Mesh>): Promise<ConvertibleTo<Transformation<Mesh>>> =>
        TupleProduct.create([
          MoveTo.create(TupleProduct.create([
            MoveToArgs.create(axis, toEdge, shift),
            (await Element.toArrayFlat(getBoundingBox(source)))[0],
            (await Element.toArrayFlat(getBoundingBox(target)))[0],
          ] as const)),
          source,
        ] as const),
    ),
)

declare global {
  namespace escad {
    interface ConversionsObj {
      "@escad/builtins/moveTo": (
        | Conversion<MoveTo<TupleProduct<readonly [MoveToArgs, BoundingBox, BoundingBox]>>, Matrix4>
      ),
    }
  }
}

const moveToConversionMeshId = Id.create(__filename, "@escad/builtins", "Conversion", "MoveToConversionMesh", "0")

conversionRegistry.register({
  id: moveToConversionMeshId,
  fromType: MoveTo.createProductType(TupleProductType.create([MoveToArgs, BoundingBox, BoundingBox])),
  toType: Matrix4,
  convert: async ({ child: { children: [args, sourceBox, targetBox] } }) => {
    const { axis } = args
    const sourceCenter = sourceBox.center[axis]
    const sourceSize = sourceBox.size[axis]
    const targetCenter = targetBox.center[axis]
    const targetSize = targetBox.size[axis]
    const targetPos = targetCenter + args.toEdge * targetSize
    const displacement = targetPos - sourceCenter + args.shift * sourceSize
    const displacementVector = { x: 0, y: 0, z: 0, [axis]: displacement }
    return Matrix4.translate(displacementVector.x, displacementVector.y, displacementVector.z)
  },
  weight: 1,
})
