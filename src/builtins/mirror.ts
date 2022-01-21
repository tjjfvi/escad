import { Component, ConvertibleTo, Elementish, mapOperation } from "../core/mod.ts"
import { Mesh } from "./Mesh.ts"
import { reflect } from "./reflect.ts"

export const mirror = Component.create(
  "mirror",
  (axis: "x" | "y" | "z", center: number = 0) =>
    mapOperation(
      "mirror",
      (value: ConvertibleTo<Mesh>): Elementish<ConvertibleTo<Mesh>> =>
        [value, reflect(axis, center)(value)],
      { showOutput: false },
    ),
  { showOutput: false },
)

export const mirrorX = Component.create("mirrorX", (center: number = 0) => mirror("x", center), { showOutput: false })
export const mirrorY = Component.create("mirrorY", (center: number = 0) => mirror("y", center), { showOutput: false })
export const mirrorZ = Component.create("mirrorZ", (center: number = 0) => mirror("z", center), { showOutput: false })
