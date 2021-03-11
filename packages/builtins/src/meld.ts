
import {
  TupleProduct,
  Conversion,
  createLeafProductUtils,
  Id,
  LeafProduct,
  Element,
  conversionRegistry,
  ArrayProduct,
  TupleProductType,
  ArrayProductType,
  ConvertibleOperation,
  Operation,
} from "@escad/core";
import { Mesh } from "./Mesh";

const meldMarkerId = Id.create(__filename, "@escad/builtins", "LeafProduct", "MeldMarker", "0");

export interface MeldMarker extends LeafProduct {
  readonly type: typeof meldMarkerId,
}

export const MeldMarker = {
  id: meldMarkerId,
  create: (): MeldMarker => ({ type: meldMarkerId }),
  ...createLeafProductUtils<MeldMarker, "MeldMarker">(meldMarkerId, "MeldMarker"),
};

export type Meld<T extends ArrayProduct | TupleProduct> = TupleProduct<[MeldMarker, T]>;
export const Meld = {
  create: <T extends ArrayProduct | TupleProduct>(children: T): Meld<T> =>
    TupleProduct.create([MeldMarker.create(), children]),
};

declare global {
  namespace escad {
    interface ConversionsObj {
      "@escad/builtins/meld": {
        computeMeld: Conversion<Meld<ArrayProduct<Mesh>>, Mesh>,
      },
    }
  }
}

conversionRegistry.register({
  fromType: TupleProductType.create([MeldMarker.productType, ArrayProductType.create(Mesh.productType)]),
  toType: Mesh.productType,
  convert: async ({ children: [, c] }: Meld<ArrayProduct<Mesh>>): Promise<Mesh> =>
    Mesh.create(c.children.flatMap(x => x.faces)),
  weight: 1,
  id: Id.create(__filename, "@escad/builtins", "Conversion", "Meld", "0"),
})

export const meld: ConvertibleOperation<Mesh, Mesh> = (
  Operation.create("meld", el =>
    Meld.create(TupleProduct.create(Element.toArrayFlat(el)))
  , { showOutputInHierarchy: false })
);
