
import {
  TupleProduct,
  Conversion,
  createLeafProductUtils,
  Id,
  LeafProduct,
  Product,
  Component,
  conversionRegistry,
  ArrayProduct,
  TupleProductType,
  ArrayProductType,
  Element,
  ConvertibleOperation,
  Operation,
  ConvertibleElement,
} from "@escad/core";
import { Bsp, ClipOptions } from "./Bsp";

const unionMarkerId = Id.create(__filename, "@escad/builtins", "LeafProduct", "UnionMarker", "0");

export interface UnionMarker extends LeafProduct {
  readonly type: typeof unionMarkerId,
}

export const UnionMarker = {
  create: (): UnionMarker => ({ type: unionMarkerId }),
  ...createLeafProductUtils<UnionMarker, "UnionMarker">(unionMarkerId, "UnionMarker"),
  id: unionMarkerId,
};

export type Union<T extends Product> = TupleProduct<[UnionMarker, T]>;
export const Union = {
  create: <T extends Product>(children: T): Union<T> =>
    TupleProduct.create([UnionMarker.create(), children]),
};

declare global {
  namespace escad {
    interface ConversionsObj {
      "@escad/builtins/union": {
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
      a = Bsp.clipTo(a, b, ClipOptions.DropBack | ClipOptions.DropCoplanarBack);
      b = Bsp.clipTo(b, a, ClipOptions.DropBack | ClipOptions.DropCoplanar);
      return Bsp.build(a, Bsp.allFaces(b)) ?? Bsp.null();
    }),
  weight: 1,
  id: Id.create(__filename, "@escad/builtins", "Conversion", "Union", "0"),
})

export const union: ConvertibleOperation<Bsp, Bsp> =
  Operation.create("union", el =>
    Union.create(TupleProduct.create(Element.toArrayFlat(el)))
  , { showOutputInHierarchy: false });

export const add: Component<ConvertibleElement<Bsp>[], ConvertibleOperation<Bsp, Bsp>> =
  Component.create("add", (...el) =>
    Operation.create("add", el2 => union(el2, el), { overrideHierarchy: false })
  , { showOutputInHierarchy: false });

