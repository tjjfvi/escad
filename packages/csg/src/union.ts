
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

const unionMarkerId = Id.create(__filename, "@escad/csg", "0", "UnionMarker");

export interface UnionMarker extends LeafProduct {
  readonly type: typeof unionMarkerId,
}

export const UnionMarker = {
  create: (): UnionMarker => ({ type: unionMarkerId }),
  ...createProductTypeUtils<UnionMarker, "UnionMarker">(unionMarkerId, "UnionMarker"),
  id: unionMarkerId,
};

export type Union<T extends Product> = TupleProduct<[UnionMarker, T]>;
export const Union = {
  create: <T extends Product>(children: T): Union<T> =>
    TupleProduct.create([UnionMarker.create(), children])
};

declare global {
  namespace escad {
    interface ConversionsObj {
      "@escad/csg/union": {
        computeUnion: Conversion<Union<ArrayProduct<Bsp>>, Bsp>,
      },
    }
  }
}

conversionRegistry.register({
  fromType: TupleProductType.create([UnionMarker.productType, ArrayProductType.create(Bsp.productType)]),
  toType: Bsp.productType,
  convert: async ({ children: [, c] }: Union<ArrayProduct<Bsp>>): Promise<Bsp> =>
    c.children.reduce((a, b) => {
      a = Bsp.clipTo(a, b);
      b = Bsp.clipTo(b, a);
      b = Bsp.invert(b);
      b = Bsp.clipTo(b, a);
      b = Bsp.invert(b);
      return Bsp.build(a, Bsp.allFaces(b)) ?? Bsp.null();
    }),
  weight: 1,
})

export const union: Operation<Bsp, Bsp> = (
  new Operation<Bsp, Bsp>("union", el =>
    Union.create(TupleProduct.create(el.toArrayFlat()))
  )
);

export const add: Component<Elementish<Bsp>[], Operation<Bsp, Bsp>> = (
  new Component("add", (...el) => new Operation<Bsp, Bsp>("add", el2 => union(el2, el)))
);
