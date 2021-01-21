
import { Conversion, conversionRegistry } from "@escad/core";
import { Mesh } from "@escad/mesh";
import { Bsp } from "./Bsp";

declare global {
  namespace escad {
    interface ConversionsObj {
      "@escad/csg/bspMeshConversion": {
        meshToBsp: Conversion<Mesh, Bsp>,
        bspToMesh: Conversion<Bsp, Mesh>,
      },
    }
  }
}

conversionRegistry.register({
  fromType: Mesh.id,
  toType: Bsp.id,
  convert: async (mesh: Mesh): Promise<Bsp> =>
    Bsp.build(null, mesh.faces) ?? Bsp.null(),
  weight: 1,
})

conversionRegistry.register({
  fromType: Bsp.id,
  toType: Mesh.id,
  convert: async (bsp: Bsp): Promise<Mesh> =>
    Mesh.create(Bsp.allFaces(bsp)),
  weight: 1,
})
