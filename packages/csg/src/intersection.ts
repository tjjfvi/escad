
import {
  CompoundProduct,
  Conversion,
  createProductTypeUtils,
  Elementish,
  Id,
  LeafProduct,
  Product,
  Component,
  Operation,
} from "@escad/core";
import { Bsp } from "./Bsp";

declare const intersectionMarkerIdSymbol: unique symbol;
const intersectionMarkerId = Id<typeof intersectionMarkerIdSymbol>("IntersectionMarker", __filename);

export interface IntersectionMarker extends LeafProduct {
  readonly type: typeof intersectionMarkerId,
}

export const IntersectionMarker = Object.assign(
  (): IntersectionMarker => ({ type: intersectionMarkerId }),
  {
    ...createProductTypeUtils<IntersectionMarker, "IntersectionMarker">(intersectionMarkerId, "IntersectionMarker"),
    id: intersectionMarkerId,
  }
);

type Intersection<A extends Product, B extends Product> = CompoundProduct<[IntersectionMarker, A, B]>;
const Intersection = <A extends Product, B extends Product>(a: A, b: B): Intersection<A, B> =>
  CompoundProduct([IntersectionMarker(), a, b]);

declare global {
  namespace escad {
    interface ConversionsObj {
      "@escad/csg/intersection": {
        computeIntersection: Conversion<Intersection<Bsp, Bsp>, Bsp>,
      },
    }
  }
}

Product.ConversionRegistry.register({
  fromType: [IntersectionMarker.id, Bsp.id, Bsp.id],
  toType: Bsp.id,
  convert: async ({ children: [, a, b] }: Intersection<Bsp, Bsp>): Promise<Bsp> => {
    a = Bsp.invert(a);
    b = Bsp.clipTo(b, a);
    b = Bsp.invert(b);
    a = Bsp.clipTo(a, b);
    b = Bsp.clipTo(b, a);
    return Bsp.invert(Bsp.build(a, Bsp.allFaces(b)) ?? Bsp.null());
  }
})

export const intersection: Operation<Bsp, Bsp> = (
  new Operation<Bsp, Bsp>("intersection", el =>
    el.toArrayFlat().reduce(Intersection)
  )
);

export const intersect: Component<Elementish<Bsp>[], Operation<Bsp, Bsp>> = (
  new Component("intersect", (...el) => new Operation<Bsp, Bsp>("intersect", el2 => intersection(el2, el)))
);
