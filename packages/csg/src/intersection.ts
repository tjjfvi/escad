
import {
  TupleProduct,
  Conversion,
  createProductTypeUtils,
  Elementish,
  Id,
  LeafProduct,
  Product,
  Component,
  Operation,
  conversionRegistry,
  ArrayProduct,
  TupleProductType,
  ArrayProductType,
} from "@escad/core";
import { Bsp } from "./Bsp";

const intersectionMarkerId = Id.create(__filename, "@escad/csg", "0", "IntersectionMarker");

export interface IntersectionMarker extends LeafProduct {
  readonly type: typeof intersectionMarkerId,
}

export const IntersectionMarker = {
  create: (): IntersectionMarker => ({ type: intersectionMarkerId }),
  ...createProductTypeUtils<IntersectionMarker, "IntersectionMarker">(intersectionMarkerId, "IntersectionMarker"),
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
      a = Bsp.invert(a);
      b = Bsp.clipTo(b, a);
      b = Bsp.invert(b);
      a = Bsp.clipTo(a, b);
      b = Bsp.clipTo(b, a);
      return Bsp.invert(Bsp.build(a, Bsp.allFaces(b)) ?? Bsp.null());
    }),
  weight: 1,
})

export const intersection: Operation<Bsp, Bsp> = (
  new Operation<Bsp, Bsp>("intersection", el =>
    Intersection.create(TupleProduct.create(el.toArrayFlat()))
  )
);

export const intersect: Component<Elementish<Bsp>[], Operation<Bsp, Bsp>> = (
  new Component("intersect", (...el) => new Operation<Bsp, Bsp>("intersect", el2 => intersection(el2, el)))
);
