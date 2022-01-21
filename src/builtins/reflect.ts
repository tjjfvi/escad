import { Component, ConvertibleTo, mapOperation, TupleProduct } from "../core/mod.ts"
import { Mesh, Transform } from "..ts"
import { FlipFaces } from "./flip.ts"
import { Matrix4 } from "./Matrix4.ts"

export const reflect = Component.create("reflect", (axis: "x" | "y" | "z", center: number = 0) => {
  const scale = { x: 1, y: 1, z: 1, [axis]: -1 }
  const translate = { x: 0, y: 0, z: 0, [axis]: center }
  const matrix = Matrix4.multiply(
    Matrix4.multiply(
      Matrix4.translate(translate.x, translate.y, translate.z),
      Matrix4.scale(scale.x, scale.y, scale.z),
    ),
    Matrix4.translate(-translate.x, -translate.y, translate.z),
  )
  return mapOperation(
    "reflect",
    (leaf: ConvertibleTo<Mesh>) =>
      FlipFaces.create(Transform.create(TupleProduct.create([matrix, leaf] as const))),
    { showOutput: false },
  )
}, { showOutput: false })

export const reflectX =
  Component.create("reflectX", (center: number = 0) => reflect("x", center), { showOutput: false })
export const reflectY =
  Component.create("reflectY", (center: number = 0) => reflect("y", center), { showOutput: false })
export const reflectZ =
  Component.create("reflectZ", (center: number = 0) => reflect("z", center), { showOutput: false })
