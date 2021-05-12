import { Component, ConvertibleElement, Operation } from "@escad/core"
import { interpretTriplet, Triplet } from "./helpers"
import { Mesh } from "./Mesh"
import { moveTo } from "./moveTo"

export const shift = Component.create("shift", (triplet: Triplet) => {
  const shift = interpretTriplet(triplet, 0)
  return Operation.create("shift", (arg: ConvertibleElement<Mesh>) =>
    moveTo(arg, {
      x: [0, shift.x],
      y: [0, shift.y],
      z: [0, shift.z],
    })(arg),
  )
})

export const shiftX = Component.create("shiftX", (x: number) => shift({ x }))
export const shiftY = Component.create("shiftY", (y: number) => shift({ y }))
export const shiftZ = Component.create("shiftZ", (z: number) => shift({ z }))
