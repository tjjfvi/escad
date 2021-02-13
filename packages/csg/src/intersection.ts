
import {
  TupleProduct,
  Conversion,
  createLeafProductUtils,
  Id,
  LeafProduct,
  Product,
  Component,
  Operation,
  conversionRegistry,
  ArrayProduct,
  TupleProductType,
  ArrayProductType,
  ConvertibleOperation,
  ConvertibleElementish,
} from "@escad/core";
import { Bsp, ClipOptions } from "./Bsp";

const intersectionMarkerId = Id.create(__filename, "@escad/csg", "0", "IntersectionMarker");

export interface IntersectionMarker extends LeafProduct {
  readonly type: typeof intersectionMarkerId,
}

export const IntersectionMarker = {
  create: (): IntersectionMarker => ({ type: intersectionMarkerId }),
  ...createLeafProductUtils<IntersectionMarker, "IntersectionMarker">(intersectionMarkerId, "IntersectionMarker"),
  id: intersectionMarkerId,
};

export type Intersection<T extends Product> = TupleProduct<[IntersectionMarker, T]>;
export const Intersection = {
  create: <T extends Product>(children: T): Intersection<T> =>
    TupleProduct.create([IntersectionMarker.create(), children])
};

declare global {
  namespace escad {
    interface ConversionsObj {
      "@escad/csg/intersection": {
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
      a = Bsp.clipTo(a, b, ClipOptions.DropFront | ClipOptions.DropCoplanarBack);
      b = Bsp.clipTo(b, a, ClipOptions.DropFront | ClipOptions.DropCoplanar);
      return Bsp.build(a, Bsp.allFaces(b)) ?? Bsp.null();
    }),
  weight: 1,
})

export const intersection: ConvertibleOperation<Bsp, Bsp> = (
  new Operation("intersection", el =>
    Intersection.create(TupleProduct.create(el.toArrayFlat()))
  )
);

export const intersect: Component<ConvertibleElementish<Bsp>[], ConvertibleOperation<Bsp, Bsp>> = (
  new Component("intersect", (...el) => new Operation("intersect", el2 => intersection(el2, el)))
);
