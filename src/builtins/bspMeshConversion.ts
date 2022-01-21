
import { Conversion, conversionRegistry, Id } from "../core/mod.ts"
import { Mesh } from "./Mesh.ts"
import { Bsp } from "./Bsp.ts"

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
  fromType: Mesh,
  toType: Bsp,
  convert: async mesh =>
    Bsp.build(null, mesh.faces) ?? Bsp.null(),
  weight: 1,
  id: Id.create(__filename, "@escad/builtins", "Conversion", "MeshBsp"),
})

conversionRegistry.register({
  fromType: Bsp,
  toType: Mesh,
  convert: async bsp =>
    Mesh.create(Bsp.allFaces(bsp)),
  weight: 1,
  id: Id.create(__filename, "@escad/builtins", "Conversion", "BspMesh"),
})
