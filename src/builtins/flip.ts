import {
  Conversion,
  conversionRegistry,
  ConvertibleTo,
  Id,
  mapOperation,
  MarkedProduct,
  Operation,
  Product,
} from "../core/mod.ts";
import { Face } from "./Face.ts";
import { Mesh } from "./Mesh.ts";

const flipFacesId = Id.create(
  import.meta.url,
  "@escad/builtins",
  "Marker",
  "FlipFaces",
);
export type FlipFaces<T extends Product> = MarkedProduct<typeof flipFacesId, T>;
export const FlipFaces = MarkedProduct.for(flipFacesId);

declare global {
  namespace escad {
    interface ConversionsObj {
      "@escad/builtins/flip": {
        flipMesh: Conversion<FlipFaces<Mesh>, Mesh>;
      };
    }
  }
}

conversionRegistry.register<FlipFaces<Mesh>, Mesh>({
  convert: async ({ child: mesh }) =>
    Mesh.create(
      mesh.faces.map((face) => Face.create(face.points.slice().reverse())),
    ),
  fromType: FlipFaces.createProductType(Mesh),
  toType: Mesh,
  weight: 1,
  id: Id.create(import.meta.url, "@escad/builtins", "Conversion", "FlipFaces"),
});

export const flip: Operation<
  ConvertibleTo<Mesh>,
  FlipFaces<ConvertibleTo<Mesh>>
> = mapOperation("flip", FlipFaces.create, { showOutput: false });
