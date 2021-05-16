import { Component, ConvertibleTo, Elementish, mapOperation } from "@escad/core"
import { Mesh } from "./Mesh"
import { reflect } from "./reflect"

export const mirror = Component.create("mirror", (axis: "x" | "y" | "z", center: number = 0) =>
  mapOperation("mirror", (value: ConvertibleTo<Mesh>): Elementish<ConvertibleTo<Mesh>> =>
    [value, reflect(axis, center)(value)],
  ),
)

export const mirrorX = Component.create("mirrorX", (center: number = 0) => mirror("x", center))
export const mirrorY = Component.create("mirrorY", (center: number = 0) => mirror("y", center))
export const mirrorZ = Component.create("mirrorZ", (center: number = 0) => mirror("z", center))
