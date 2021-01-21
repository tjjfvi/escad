
import {
  CompoundProduct,
  Conversion,
  createProductTypeUtils,
  Elementish,
  Id,
  LeafProduct,
  Product,
  Element,
  Component,
  Operation,
  conversionRegistry,
} from "@escad/core";
import { Bsp } from "./Bsp";
import { Union } from "./union";

const diffMarkerId = Id.create(__filename, "@escad/csg", "0", "DiffMarker");

export interface DiffMarker extends LeafProduct {
  readonly type: typeof diffMarkerId,
}

export const DiffMarker = {
  create: (): DiffMarker => ({ type: diffMarkerId }),
  ...createProductTypeUtils<DiffMarker, "DiffMarker">(diffMarkerId, "DiffMarker"),
  id: diffMarkerId,
};

export type Diff<A extends Product, B extends Product> = CompoundProduct<[DiffMarker, A, B]>;
export const Diff = {
  create: <A extends Product, B extends Product>(a: A, b: B): Diff<A, B> =>
    CompoundProduct.create([DiffMarker.create(), a, b]),
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
  fromType: [DiffMarker.id, Bsp.id, Bsp.id],
  toType: Bsp.id,
  convert: async ({ children: [, a, b] }: Diff<Bsp, Bsp>): Promise<Bsp> => {
    a = Bsp.invert(a);
    a = Bsp.clipTo(a, b);
    b = Bsp.clipTo(b, a);
    b = Bsp.invert(b);
    b = Bsp.clipTo(b, a);
    b = Bsp.invert(b);
    return Bsp.invert(Bsp.build(a, Bsp.allFaces(b)) ?? Bsp.null());
  },
  weight: 1,
})

export const diff: Operation<Bsp, Bsp> = (
  new Operation<Bsp, Bsp>("diff", el => {
    let originalArgs: Elementish<Bsp> = el.toArrayDeep();
    if(!(originalArgs instanceof Array))
      return originalArgs;
    if(originalArgs.length === 0)
      return [];
    if(originalArgs.length === 1)
      [originalArgs] = originalArgs;
    const args = Element.create(originalArgs).toArrayDeep();
    if(Product.isProduct(args))
      return args;
    const positive = new Element<Bsp>(args[0]).toArrayFlat().reduce(Union.create);
    const negative = new Element<Bsp>(args.slice(1)).toArrayFlat().reduce(Union.create);
    if(!positive || !negative) // If array length is zero, reduce returns undefined
      return positive ?? [];
    return Diff.create(positive, negative);
  })
);

export const sub: Component<Elementish<Bsp>[], Operation<Bsp, Bsp>> = (
  new Component("sub", (...el) => new Operation<Bsp, Bsp>("sub", el2 => diff(el2, el)))
);
