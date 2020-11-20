
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

declare const unionMarkerIdSymbol: unique symbol;
const unionMarkerId = Id<typeof unionMarkerIdSymbol>("UnionMarker", __filename);

export interface UnionMarker extends LeafProduct {
  readonly type: typeof unionMarkerId,
}

export const UnionMarker = Object.assign(
  (): UnionMarker => ({ type: unionMarkerId }),
  {
    ...createProductTypeUtils<UnionMarker, "UnionMarker">(unionMarkerId, "UnionMarker"),
    id: unionMarkerId,
  }
);

export type Union<A extends Product, B extends Product> = CompoundProduct<[UnionMarker, A, B]>;
export const Union = <A extends Product, B extends Product>(a: A, b: B): Union<A, B> =>
  CompoundProduct([UnionMarker(), a, b]);

declare global {
  namespace escad {
    interface ConversionsObj {
      "@escad/csg/union": {
        computeUnion: Conversion<Union<Bsp, Bsp>, Bsp>,
      },
    }
  }
}

Product.ConversionRegistry.register({
  fromType: [UnionMarker.id, Bsp.id, Bsp.id],
  toType: Bsp.id,
  convert: async ({ children: [, a, b] }: Union<Bsp, Bsp>): Promise<Bsp> => {
    a = Bsp.clipTo(a, b);
    b = Bsp.clipTo(b, a);
    b = Bsp.invert(b);
    b = Bsp.clipTo(b, a);
    b = Bsp.invert(b);
    return Bsp.build(a, Bsp.allFaces(b)) ?? Bsp.null();
  }
})

export const union: Operation<Bsp, Bsp> = (
  new Operation<Bsp, Bsp>("union", el =>
    el.toArrayFlat().reduce(Union)
  )
);

export const add: Component<Elementish<Bsp>[], Operation<Bsp, Bsp>> = (
  new Component("add", (...el) => new Operation<Bsp, Bsp>("add", el2 => union(el2, el)))
);
