import { CompoundProduct, Conversion, Product, conversionRegistry } from "@escad/core";
import { Face, Mesh } from "@escad/mesh";
import { Matrix4 } from "./Matrix4";

export type Transformation<T extends Product> = CompoundProduct<readonly [Matrix4, T]>;
export const Transformation = {
  create: <T extends Product>(matrix: Matrix4, p: T): Transformation<T> =>
    CompoundProduct.create([matrix, p])
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
  fromType: [Matrix4.id, Mesh.id],
  toType: Mesh.id,
  weight: 1,
})
