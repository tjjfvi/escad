
import { Matrix4 } from "./Matrix4"
import { Component, mapOperation, ConvertibleOperation, TupleProduct } from "@escad/core"
import { Transform, Transformation } from "./Transformation"
import { Mesh } from "./Mesh"

const tau = Math.PI * 2

type RotateOpts = { unit?: "radians" | "rad" | "degrees" | "deg" }
type RotateArgs =
  | [number, number, number, RotateOpts?]
  | [{ x?: number, y?: number, z?: number }, RotateOpts?]
  | [{ x?: number, y?: number, z?: number } & RotateOpts]
  | [[number, number, number], RotateOpts?]

export const rotate: Component<RotateArgs, ConvertibleOperation<Mesh, Transformation<Mesh>>> =
  Component.create("rotate", (...args: RotateArgs) => {
    let [first] = args
    let triple =
    args.length === 3
      ? args
      : args.length === 4
        ? args
        : typeof first === "object"
          ? first
          : [0, 0, 0] as [0, 0, 0]
    let opts =
      args.length === 4
        ? args[3]
        : args.length === 2
          ? args[1]
          : typeof first === "object" && "unit" in first
            ? first
            : undefined
    let arr = triple instanceof Array ? triple : [triple.x ?? 0, triple.y ?? 0, triple.z ?? 0] as const

    let [x, y, z] = arr

    let { unit = "deg" } = opts ?? {}
    let radians = unit === "rad" || unit === "radians"
    let multiplier = radians ? 1 : tau / 360

    x *= multiplier
    y *= multiplier
    z *= multiplier

    let m = Matrix4.multiply(Matrix4.multiply(Matrix4.rotateX(x), Matrix4.rotateY(y)), Matrix4.rotateZ(z))

    return mapOperation(
      "rotate",
      leaf =>
        Transform.create(TupleProduct.create([m, leaf] as const)),
      { showOutput: false },
    )
  }, { showOutput: false })

export const rX: Component<[number], ConvertibleOperation<Mesh, Transformation<Mesh>>> =
  Component.create("rX", (n: number) => rotate({ x: n }), { showOutput: false })
export const rY: Component<[number], ConvertibleOperation<Mesh, Transformation<Mesh>>> =
  Component.create("rY", (n: number) => rotate({ y: n }), { showOutput: false })
export const rZ: Component<[number], ConvertibleOperation<Mesh, Transformation<Mesh>>> =
  Component.create("rZ", (n: number) => rotate({ z: n }), { showOutput: false })

export const rotateX = rX
export const rotateY = rY
export const rotateZ = rZ
