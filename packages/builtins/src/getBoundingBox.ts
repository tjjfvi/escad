
import {
  Element,
  createLeafProductUtils,
  Id,
  LeafProduct,
  Operation,
  Product,
  TupleProduct,
  ConvertibleTo,
  Conversion,
  conversionRegistry,
  TupleProductType,
  ArrayProductType,
  ArrayProduct,
} from "@escad/core"
import { BoundingBox } from "./BoundingBox"
import { Mesh } from "./Mesh"
import { Vector3 } from "./Vector3"

const getBoundingBoxMarkerId = Id.create(__filename, "@escad/builtins", "LeafProduct", "GetBoundingBoxMarker", "0")

export interface GetBoundingBoxMarker extends LeafProduct {
  readonly type: typeof getBoundingBoxMarkerId,
}

export const GetBoundingBoxMarker = {
  create: (): GetBoundingBoxMarker => ({ type: getBoundingBoxMarkerId }),
  ...createLeafProductUtils<GetBoundingBoxMarker, "GetBoundingBoxMarker">(
    getBoundingBoxMarkerId,
    "GetBoundingBoxMarker",
  ),
  id: getBoundingBoxMarkerId,
}

declare global {
  namespace escad {
    interface ConversionsObj {
      "@escad/builtins/getBoundingBox": (
        | Conversion<GetBoundingBox<ArrayProduct<Mesh>>, BoundingBox>
      ),
    }
  }
}

conversionRegistry.register({
  id: Id.create(__filename, "@escad/builtins", "Conversion", "GetBoundingBoxMesh", "0"),
  fromType: TupleProductType.create([GetBoundingBoxMarker, ArrayProductType.create(Mesh)]),
  toType: BoundingBox,
  convert: async ({ children: [, { children: meshes }] }) => {
    let min, max
    for(const mesh of meshes)
      for(const face of mesh.faces)
        for(const vertex of face.points) {
          min = Vector3.min(min ?? vertex, vertex)
          max = Vector3.max(max ?? vertex, vertex)
        }
    if(!min || !max)
      throw new Error("Cannot convert empty meshes to BoundingBox")
    return BoundingBox.create(min, max)
  },
  weight: 1,
})

export type GetBoundingBox<T extends Product> = TupleProduct<readonly [GetBoundingBoxMarker, T]>
export const GetBoundingBox = {
  create: <T extends Product>(p: T): GetBoundingBox<T> =>
    TupleProduct.create([GetBoundingBoxMarker.create(), p]),
}

export const getBoundingBox = Operation.create("getBoundingBox", async (args: Element<ConvertibleTo<Mesh>>) =>
  GetBoundingBox.create(TupleProduct.create(await Element.toArrayFlat(args))),
)
