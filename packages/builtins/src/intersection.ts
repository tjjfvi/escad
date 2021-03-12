
import {
  TupleProduct,
  Conversion,
  createLeafProductUtils,
  Id,
  LeafProduct,
  Product,
  Component,
  Element,
  conversionRegistry,
  ArrayProduct,
  TupleProductType,
  ArrayProductType,
  ConvertibleOperation,
  ConvertibleElementish,
  Operation,
} from "@escad/core"
import { Bsp, ClipOptions } from "./Bsp"

const intersectionMarkerId = Id.create(__filename, "@escad/builtins", "LeafProduct", "IntersectionMarker", "0")

export interface IntersectionMarker extends LeafProduct {
  readonly type: typeof intersectionMarkerId,
}

export const IntersectionMarker = {
  create: (): IntersectionMarker => ({ type: intersectionMarkerId }),
  ...createLeafProductUtils<IntersectionMarker, "IntersectionMarker">(intersectionMarkerId, "IntersectionMarker"),
  id: intersectionMarkerId,
}

export type Intersection<T extends Product> = TupleProduct<[IntersectionMarker, T]>
export const Intersection = {
  create: <T extends Product>(children: T): Intersection<T> =>
    TupleProduct.create([IntersectionMarker.create(), children]),
}

declare global {
  namespace escad {
    interface ConversionsObj {
      "@escad/builtins/intersection": {
        computeIntersection: Conversion<Intersection<ArrayProduct<Bsp>>, Bsp>,
      },
    }
  }
}

conversionRegistry.register({
  fromType: TupleProductType.create([IntersectionMarker.productType, ArrayProductType.create(Bsp.productType)]),
  toType: Bsp.productType,
  convert: async ({ children: [, c] }: Intersection<ArrayProduct<Bsp>>): Promise<Bsp> =>
    c.children.reduce((a, b) => {
      a = Bsp.clipTo(a, b, ClipOptions.DropFront | ClipOptions.DropCoplanarBack)
      b = Bsp.clipTo(b, a, ClipOptions.DropFront | ClipOptions.DropCoplanar)
      return Bsp.build(a, Bsp.allFaces(b)) ?? Bsp.null()
    }),
  weight: 1,
  id: Id.create(__filename, "@escad/builtins", "Conversion", "Intersection", "0"),
})

export const intersection: ConvertibleOperation<Bsp, Bsp> =
  Operation.create("intersection", el =>
    Intersection.create(TupleProduct.create(Element.toArrayFlat(el)))
  , { showOutputInHierarchy: false })

export const intersect: Component<ConvertibleElementish<Bsp>[], ConvertibleOperation<Bsp, Bsp>> =
  Component.create("intersect", (...el) =>
    Operation.create("intersect", el2 => intersection(el2, el), { overrideHierarchy: false })
  , { showOutputInHierarchy: false })
