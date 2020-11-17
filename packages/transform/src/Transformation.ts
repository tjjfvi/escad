import { CompoundProduct, Conversion, Product } from "@escad/core";
import { Face, Mesh } from "@escad/mesh";
import { Matrix4 } from "./Matrix4";

export type Transformation<T extends Product> = CompoundProduct<readonly [Matrix4, T]>;
export const Transformation = <T extends Product>(matrix: Matrix4, p: T): Transformation<T> => {
  console.log(matrix, p);
  return CompoundProduct([matrix, p])
}

declare global {
  namespace escad {
    interface ConversionsObj {
      "@escad/transform/Transformation": {
        transformMesh: Conversion<Transformation<Mesh>, Mesh>,
      },
    }
  }
}

Product.ConversionRegistry.register<Transformation<Mesh>, Mesh>({
  convert: async ({ children: [matrix, mesh] }) =>
    Mesh(mesh.faces.map(face =>
      Face(face.points.map(vector =>
        Matrix4.multiplyVector(matrix, vector)
      ))
    )),
  fromType: [Matrix4.id, Mesh.id],
  toType: Mesh.id,
})
