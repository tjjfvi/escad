
import { Conversion, conversionRegistry, Id } from "@escad/core";
import { Mesh } from "./Mesh";
import { Bsp } from "./Bsp";

declare global {
  namespace escad {
    interface ConversionsObj {
      "@escad/builtins/bspMeshConversion": {
        meshToBsp: Conversion<Mesh, Bsp>,
        bspToMesh: Conversion<Bsp, Mesh>,
      },
    }
  }
}

conversionRegistry.register({
  fromType: Mesh.productType,
  toType: Bsp.productType,
  convert: async (mesh: Mesh): Promise<Bsp> =>
    Bsp.build(null, mesh.faces) ?? Bsp.null(),
  weight: 1,
  id: Id.create(__filename, "@escad/builtins", "Conversion", "MeshBsp", "0"),
})

conversionRegistry.register({
  fromType: Bsp.productType,
  toType: Mesh.productType,
  convert: async (bsp: Bsp): Promise<Mesh> =>
    Mesh.create(Bsp.allFaces(bsp)),
  weight: 1,
  id: Id.create(__filename, "@escad/builtins", "Conversion", "BspMesh", "0"),
})
