import { TupleProduct, Conversion, Product, conversionRegistry, TupleProductType } from "@escad/core";
import { Face, Mesh } from "@escad/mesh";
import { Matrix4 } from "./Matrix4";

export type Transformation<T extends Product> = TupleProduct<readonly [Matrix4, T]>;
export const Transformation = {
  create: <T extends Product>(matrix: Matrix4, p: T): Transformation<T> =>
    TupleProduct.create([matrix, p])
};

declare global {
  namespace escad {
    interface ConversionsObj {
      "@escad/transform/Transformation": {
        transformMesh: Conversion<Transformation<Mesh>, Mesh>,
      },
    }
  }
}

conversionRegistry.register<Transformation<Mesh>, Mesh>({
  convert: async ({ children: [matrix, mesh] }) =>
    Mesh.create(mesh.faces.map(face =>
      Face.create(face.points.map(vector =>
        Matrix4.multiplyVector(matrix, vector)
      ))
    )),
  fromType: TupleProductType.create([Matrix4.productType, Mesh.productType]),
  toType: Mesh.productType,
  weight: 1,
})
