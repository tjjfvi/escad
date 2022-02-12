import {
  Conversion,
  conversionRegistry,
  Id,
  MarkedProduct,
  Product,
  TupleProduct,
  TupleProductType,
} from "../core/mod.ts";
import { Mesh } from "./Mesh.ts";
import { Matrix4 } from "./Matrix4.ts";
import { Face } from "./Face.ts";

const transformId = Id.create(
  import.meta.url,
  "@escad/3d",
  "Marker",
  "Transform",
);
export type Transform<T extends Product> = MarkedProduct<typeof transformId, T>;
export const Transform = MarkedProduct.for(transformId);

export type Transformation<T extends Product> = Transform<
  TupleProduct<readonly [Matrix4, T]>
>;

declare global {
  namespace escad {
    interface ConversionsObj {
      "@escad/3d/Transformation": {
        transformMesh: Conversion<
          Transform<TupleProduct<readonly [Matrix4, Mesh]>>,
          Mesh
        >;
      };
    }
  }
}

conversionRegistry.register({
  fromType: Transform.createProductType(
    TupleProductType.create([Matrix4, Mesh]),
  ),
  toType: Mesh,
  convert: async ({ child: { children: [matrix, mesh] } }) =>
    Mesh.create(
      mesh.faces.map((face) =>
        Face.create(
          face.points.map((vector) => Matrix4.multiplyVector(matrix, vector)),
        )
      ),
    ),
  weight: 1,
  id: Id.create(
    import.meta.url,
    "@escad/3d",
    "Conversion",
    "Transformation",
  ),
});
