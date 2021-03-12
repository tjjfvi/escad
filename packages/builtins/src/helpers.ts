import { Vector3 } from "./Vector3"

export type TripletObj<T> = Partial<Record<"x" | "y" | "z" | 0 | 1 | 2, T>>
export type Triplet<T> = T | TripletObj<T>
export const interpretTriplet =
  (trip: Triplet<number | boolean> | undefined, def: number): Vector3 =>
    typeof trip === "object"
      ? Vector3.create(nb2n(trip.x ?? trip[0] ?? def), nb2n(trip.y ?? trip[1] ?? def), nb2n(trip.z ?? trip[2] ?? def))
      : Vector3.create(nb2n(trip ?? def), nb2n(trip ?? def), nb2n(trip ?? def))

const nb2n = (val: boolean | number) => typeof val === "boolean" ? val ? 0 : 1 : val
