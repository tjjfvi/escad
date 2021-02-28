
import {
  TupleProduct,
  Conversion,
  createLeafProductUtils,
  Id,
  LeafProduct,
  Product,
  Element,
  Component,
  conversionRegistry,
  TupleProductType,
  ConvertibleOperation,
  ConvertibleElementish,
  Operation,
} from "@escad/core";
import { Bsp, ClipOptions } from "./Bsp";
import { Union } from "./union";

const diffMarkerId = Id.create(__filename, "@escad/csg", "LeafProduct", "DiffMarker", "0");

export interface DiffMarker extends LeafProduct {
  readonly type: typeof diffMarkerId,
}

export const DiffMarker = {
  create: (): DiffMarker => ({ type: diffMarkerId }),
  ...createLeafProductUtils<DiffMarker, "DiffMarker">(diffMarkerId, "DiffMarker"),
  id: diffMarkerId,
};

export type Diff<A extends Product, B extends Product> = TupleProduct<[DiffMarker, A, B]>;
export const Diff = {
  create: <A extends Product, B extends Product>(a: A, b: B): Diff<A, B> =>
    TupleProduct.create([DiffMarker.create(), a, b]),
}

declare global {
  namespace escad {
    interface ConversionsObj {
      "@escad/csg/diff": {
        computeDiff: Conversion<Diff<Bsp, Bsp>, Bsp>,
      },
    }
  }
}

conversionRegistry.register({
  fromType: TupleProductType.create([DiffMarker.productType, Bsp.productType, Bsp.productType]),
  toType: Bsp.productType,
  convert: async ({ children: [, a, b] }: Diff<Bsp, Bsp>): Promise<Bsp> => {
    b = Bsp.invert(b);
    a = Bsp.clipTo(a, b, ClipOptions.DropFront | ClipOptions.DropCoplanar)
    b = Bsp.clipTo(b, a, ClipOptions.DropFront | ClipOptions.DropCoplanarBack)
    return Bsp.build(a, Bsp.allFaces(b)) ?? Bsp.null();
  },
  weight: 1,
})

export const diff: ConvertibleOperation<Bsp, Bsp> =
  Operation.create("diff", el => {
    let originalArgs: ConvertibleElementish<Bsp> = Element.toArrayDeep(el);
    if(!(originalArgs instanceof Array))
      return originalArgs;
    if(originalArgs.length === 0)
      return [];
    if(originalArgs.length === 1)
      [originalArgs] = originalArgs;
    const args = Element.toArrayDeep(Element.create(originalArgs));
    if(Product.isProduct(args))
      return args;
    const positive = Union.create(TupleProduct.create(Element.toArrayFlat(args[0])));
    const negative = Union.create(TupleProduct.create(Element.toArrayFlat(args.slice(1))));
    return Diff.create(positive, negative);
  }, { showOutputInHierarchy: false });

export const sub: Component<ConvertibleElementish<Bsp>[], ConvertibleOperation<Bsp, Bsp>> =
  Component.create("sub", (...el) =>
    Operation.create("sub", el2 => diff(el2, el), { overrideHierarchy: false })
  , { showOutputInHierarchy: false })
