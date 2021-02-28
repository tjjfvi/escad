
import {
  Id,
  LeafProduct,
  createLeafProductUtils,
  Product,
  TupleProduct,
  Conversion,
  mapOperation,
  conversionRegistry,
  TupleProductType,
  ConvertibleOperation,
} from "@escad/core";
import { Mesh, Face } from "@escad/mesh";

const flipFacesMarkerId = Id.create(__filename, "@escad/transform", "LeafProduct", "FlipFacesProduct", "0");

export interface FlipFacesMarker extends LeafProduct {
  readonly type: typeof flipFacesMarkerId,
}

export const FlipFacesMarker = {
  create: () => ({ type: flipFacesMarkerId }),
  ...createLeafProductUtils<FlipFacesMarker, "FlipFacesProduct">(flipFacesMarkerId, "FlipFacesProduct"),
  id: flipFacesMarkerId,
};

export type FlipFaces<T extends Product> = TupleProduct<readonly [FlipFacesMarker, T]>;
export const FlipFaces = {
  create: <T extends Product>(p: T): FlipFaces<T> =>
    TupleProduct.create([FlipFacesMarker.create(), p])
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
  fromType: TupleProductType.create([FlipFacesMarker.productType, Mesh.productType]),
  toType: Mesh.productType,
  weight: 1,
})

export const flip: ConvertibleOperation<Mesh, FlipFaces<Mesh>> =
  mapOperation("flip", FlipFaces.create, { showOutputInHierarchy: false });
