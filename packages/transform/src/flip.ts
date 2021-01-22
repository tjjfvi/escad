
import {
  Id,
  LeafProduct,
  createProductTypeUtils,
  Product,
  TupleProduct,
  Conversion,
  Operation,
  mapOperation,
  conversionRegistry,
  TupleProductType,
} from "@escad/core";
import { Mesh, Face } from "@escad/mesh";

const flipFacesProductId = Id.create(__filename, "@escad/transform", "0", "FlipFacesProduct");

export interface FlipFacesProduct extends LeafProduct {
  readonly type: typeof flipFacesProductId,
}

export const FlipFacesProduct = {
  create: () => ({ type: flipFacesProductId }),
  ...createProductTypeUtils<FlipFacesProduct, "FlipFacesProduct">(flipFacesProductId, "FlipFacesProduct"),
  id: flipFacesProductId,
};

export type FlipFaces<T extends Product> = TupleProduct<readonly [FlipFacesProduct, T]>;
export const FlipFaces = {
  create: <T extends Product>(p: T): FlipFaces<T> =>
    TupleProduct.create([FlipFacesProduct.create(), p])
};

declare global {
  namespace escad {
    interface ConversionsObj {
      "@escad/transform/flip": {
        flipMesh: Conversion<FlipFaces<Mesh>, Mesh>,
      },
    }
  }
}

conversionRegistry.register<FlipFaces<Mesh>, Mesh>({
  convert: async ({ children: [, mesh] }) =>
    Mesh.create(mesh.faces.map(face =>
      Face.create(face.points.slice().reverse())
    )),
  fromType: TupleProductType.create([FlipFacesProduct.productType, Mesh.productType]),
  toType: Mesh.productType,
  weight: 1,
})

export const flip: Operation<Mesh, FlipFaces<Mesh>> = mapOperation<Mesh, FlipFaces<Mesh>>("flip", FlipFaces.create);
