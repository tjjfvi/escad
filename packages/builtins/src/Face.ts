
import { Vector3 } from "./Vector3";
import { Plane } from "./Plane";

export interface Face {
  readonly points: readonly Vector3[],
  readonly plane: Plane,
}

export const Face = {
  create: (points: Array<Vector3>): Face => ({
    points,
    plane: Plane.create(points),
  }),
  toTriangles: (face: Face): Face[] =>
    face.points.slice(2).map((_, i) => Face.create([face.points[0], face.points[i + 1], face.points[i + 2]])),
  flip: (face: Face) =>
    Face.create([...face.points].reverse())
}
