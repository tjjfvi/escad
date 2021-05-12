
import { Matrix4 } from "./Matrix4"
import { Component, mapOperation, ConvertibleOperation, TupleProduct } from "@escad/core"
import { Transform } from "./Transformation"
import { FlipFaces } from "./flip"
import { Mesh } from "./Mesh"

type ScaleArgs =
  | [number]
  | [number, number, number]
  | [{ x?: number, y?: number, z?: number }]
  | [[number, number, number]]
export const scale: Component<ScaleArgs, ConvertibleOperation<Mesh, Mesh>> =
  Component.create("scale", (...args: ScaleArgs) => {
    let triple =
      args.length === 3
        ? args
        : typeof args[0] === "number"
          ? [args[0], args[0], args[0]] as [number, number, number]
          : args[0]
    let arr = triple instanceof Array ? triple : [triple.x ?? 1, triple.y ?? 1, triple.z ?? 1] as const

    let matrix = Matrix4.scale(...arr)

    let sign = Math.sign(arr[0] * arr[1] * arr[2])
    let shouldFlip = sign === -1

    return mapOperation("scale", leaf => {
      let transformed = Transform.create(TupleProduct.create([matrix, leaf] as const))
      return shouldFlip ?  FlipFaces.create(transformed) : transformed
    }, { showOutput: false })
  }, { showOutput: false })

export const sX: Component<[number], ConvertibleOperation<Mesh, Mesh>> =
  Component.create("sX", (n: number) => scale({ x: n }), { showOutput: false })
export const sY: Component<[number], ConvertibleOperation<Mesh, Mesh>> =
  Component.create("sY", (n: number) => scale({ y: n }), { showOutput: false })
export const sZ: Component<[number], ConvertibleOperation<Mesh, Mesh>> =
  Component.create("sZ", (n: number) => scale({ z: n }), { showOutput: false })

export const scaleX = sX
export const scaleY = sY
export const scaleZ = sZ
