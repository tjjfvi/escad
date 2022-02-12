import {
  ArrayProduct,
  ArrayProductType,
  Conversion,
  conversionRegistry,
  ConvertibleOperation,
  Element,
  Id,
  MarkedProduct,
  Operation,
  Product,
  TupleProduct,
} from "../../core/mod.ts";
import { Mesh } from "../Mesh.ts";

const meldId = Id.create(import.meta.url, "@escad/builtins", "Marker", "Meld");
export type Meld<T extends Product> = MarkedProduct<typeof meldId, T>;
export const Meld = MarkedProduct.for(meldId);

declare global {
  namespace escad {
    interface ConversionsObj {
      "@escad/builtins/meld": {
        computeMeld: Conversion<Meld<ArrayProduct<Mesh>>, Mesh>;
      };
    }
  }
}

conversionRegistry.register({
  fromType: Meld.createProductType(ArrayProductType.create(Mesh)),
  toType: Mesh,
  convert: async ({ child: { children } }) =>
    Mesh.create(children.flatMap((x) => x.faces)),
  weight: 1,
  id: Id.create(import.meta.url, "@escad/builtins", "Conversion", "Meld"),
});

export const meld: ConvertibleOperation<Mesh, Mesh> = (
  Operation.create(
    "meld",
    async (el) =>
      Meld.create(TupleProduct.create(await Element.toArrayFlat(el))),
    { showOutput: false },
  )
);
