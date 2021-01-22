
import {
  TupleProduct,
  Conversion,
  createProductTypeUtils,
  Id,
  LeafProduct,
  Operation,
  conversionRegistry,
  ArrayProduct,
  TupleProductType,
  ArrayProductType,
} from "@escad/core";
import { Mesh } from "@escad/mesh";

const meldMarkerId = Id.create(__filename, "@escad/csg", "0", "MeldMarker");

export interface MeldMarker extends LeafProduct {
  readonly type: typeof meldMarkerId,
}

export const MeldMarker = {
  id: meldMarkerId,
  create: (): MeldMarker => ({ type: meldMarkerId }),
  ...createProductTypeUtils<MeldMarker, "MeldMarker">(meldMarkerId, "MeldMarker"),
};

export type Meld<T extends ArrayProduct | TupleProduct> = TupleProduct<[MeldMarker, T]>;
export const Meld = {
  create: <T extends ArrayProduct | TupleProduct>(children: T): Meld<T> =>
    TupleProduct.create([MeldMarker.create(), children]),
};

declare global {
  namespace escad {
    interface ConversionsObj {
      "@escad/csg/meld": {
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
})

export const meld: Operation<Mesh, Mesh> = (
  new Operation<Mesh, Mesh>("meld", el =>
    Meld.create(TupleProduct.create(el.toArrayFlat()))
  )
);
