
import { Vector3 } from "./Vector3";
import { Plane } from "./Plane";

export interface Face {
  readonly points: readonly Vector3[],
  readonly plane: Plane,
}

export const Face = {
  create: (points: Array<Vector3>): Face => {
    if(points.length !== 3)
      throw new Error("Faces can only be triangles");
    return {
      points,
      plane: Plane.create(points),
    };
  },
  flip: (face: Face) =>
    Face.create([...face.points].reverse())
}
