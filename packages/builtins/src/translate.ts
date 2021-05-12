
import { Matrix4 } from "./Matrix4"
import { Mesh } from "./Mesh"
import { mapOperation, Component, ConvertibleOperation, TupleProduct } from "@escad/core"
import { Transform, Transformation } from "./Transformation"

export type TranslateArgs =
  | [number, number, number]
  | [{ x?: number, y?: number, z?: number }]
  | [[number, number, number]]

export const translate: Component<TranslateArgs, ConvertibleOperation<Mesh, Transformation<Mesh>>> =
  Component.create("translate", (...args: TranslateArgs) => {
    let triple = args.length === 3 ? args : args[0]
    let arr = triple instanceof Array ? triple : [triple.x ?? 0, triple.y ?? 0, triple.z ?? 0] as const

    let matrix = Matrix4.translate(...arr)

    return mapOperation(
      "translate",
      mesh => Transform.create(TupleProduct.create([matrix, mesh] as const)),
      { showOutputInHierarchy: false },
    )
  }, { showOutputInHierarchy: false })

export const tX: Component<[number], ConvertibleOperation<Mesh, Transformation<Mesh>>> =
  Component.create("tX", (n: number) => translate({ x: n }), { showOutputInHierarchy: false })
export const tY: Component<[number], ConvertibleOperation<Mesh, Transformation<Mesh>>> =
  Component.create("tY", (n: number) => translate({ y: n }), { showOutputInHierarchy: false })
export const tZ: Component<[number], ConvertibleOperation<Mesh, Transformation<Mesh>>> =
  Component.create("tZ", (n: number) => translate({ z: n }), { showOutputInHierarchy: false })

export const translateX = tX
export const translateY = tY
export const translateZ = tZ
