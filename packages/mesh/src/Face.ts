
import { Vector3 } from "./Vector3";
import { Plane } from "./Plane";
import { concat, Serializer } from "tszer";

class Face {

  points: Array<Vector3>;
  plane: Plane;

  constructor(points: Array<Vector3>){
    if(points.length !== 3)
      throw new Error("Faces can only be triangles");
    this.points = points;
    this.plane = new Plane(points);
  }

  clone(){
    return new Face(this.points.map(p => p.clone()));
  }

  flip(){
    return new Face([...this.points].reverse());
  }

  static serializer: () => Serializer<Face> = () =>
    concat(
      Vector3.serializer(),
      Vector3.serializer(),
      Vector3.serializer(),
    ).map<Face>({
      serialize: face => face.points as any,
      deserialize: points => new Face(points),
    });

}

export { Face };
