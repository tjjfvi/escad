import { Vector3 } from "./Vector3.ts";

export type TripletObj = Partial<Record<"x" | "y" | "z" | 0 | 1 | 2, number>>;
export type Triplet = number | TripletObj;
export const interpretTriplet = (
  trip: Triplet | undefined,
  def: number,
): Vector3 =>
  typeof trip === "object"
    ? Vector3.create(
      trip.x ?? trip[0] ?? def,
      trip.y ?? trip[1] ?? def,
      trip.z ?? trip[2] ?? def,
    )
    : Vector3.create(trip ?? def, trip ?? def, trip ?? def);
