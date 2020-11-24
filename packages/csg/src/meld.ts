
import {
  CompoundProduct,
  Conversion,
  createProductTypeUtils,
  Id,
  LeafProduct,
  Product,
  Operation,
} from "@escad/core";
import { Mesh } from "@escad/mesh";

declare const meldMarkerIdSymbol: unique symbol;
const meldMarkerId = Id.create<typeof meldMarkerIdSymbol>("MeldMarker", __filename);

export interface MeldMarker extends LeafProduct {
  readonly type: typeof meldMarkerId,
}

export const MeldMarker = {
  create: (): MeldMarker => ({ type: meldMarkerId }),
  ...createProductTypeUtils<MeldMarker, "MeldMarker">(meldMarkerId, "MeldMarker"),
  id: meldMarkerId,
};

export type Meld<A extends Product, B extends Product> = CompoundProduct<[MeldMarker, A, B]>;
export const Meld = {
  create: <A extends Product, B extends Product>(a: A, b: B): Meld<A, B> =>
    CompoundProduct.create([MeldMarker.create(), a, b]),
};

declare global {
  namespace escad {
    interface ConversionsObj {
      "@escad/csg/meld": {
        computeMeld: Conversion<Meld<Mesh, Mesh>, Mesh>,
      },
    }
  }
}

Product.ConversionRegistry.register({
  fromType: [MeldMarker.id, Mesh.id, Mesh.id],
  toType: Mesh.id,
  convert: async ({ children: [, a, b] }: Meld<Mesh, Mesh>): Promise<Mesh> =>
    Mesh.create(a.faces.concat(b.faces))
})

export const meld: Operation<Mesh, Mesh> = (
  new Operation<Mesh, Mesh>("meld", el =>
    el.toArrayFlat().reduce(Meld.create)
  )
);
