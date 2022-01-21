import { Component, ConvertibleElement, Operation } from "../core/mod.ts";
import { interpretTriplet, Triplet } from "./helpers.ts";
import { Mesh } from "./Mesh.ts";
import { moveTo } from "./moveTo.ts";

export const shift = Component.create("shift", (triplet: Triplet) => {
  const shift = interpretTriplet(triplet, 0);
  return Operation.create(
    "shift",
    (arg: ConvertibleElement<Mesh>) =>
      moveTo(arg, {
        x: [0, shift.x],
        y: [0, shift.y],
        z: [0, shift.z],
      })(arg),
    { showOutput: false },
  );
}, { showOutput: false });

export const shiftX = Component.create("shiftX", (x: number) => shift({ x }), {
  showOutput: false,
});
export const shiftY = Component.create("shiftY", (y: number) => shift({ y }), {
  showOutput: false,
});
export const shiftZ = Component.create("shiftZ", (z: number) => shift({ z }), {
  showOutput: false,
});
