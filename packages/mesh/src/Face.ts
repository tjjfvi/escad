
import { Vector3 } from "./Vector3";
import { Plane } from "./Plane";
import { Product, Id, FinishedProduct } from "@escad/core";
import { DeserializeFunc, SerializeFunc, concat, Serializer } from "tszer";

class Face extends Product<Face> {

  type = Face;

  static id = new Id("Face", __filename);

  points: Array<Vector3>;
  plane: Plane;

  constructor(points: Array<Vector3>){
    super();
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

  static serializer: () => Serializer<FinishedProduct<Face>> = () =>
    concat(
      Vector3.serializer(),
      Vector3.serializer(),
      Vector3.serializer(),
    ).map<FinishedProduct<Face>>({
      serialize: face => face.points as any,
      deserialize: points => new Face(points).finish(),
    });

  serialize: SerializeFunc<FinishedProduct<Face>> = Face.serializer().serialize;

  static deserialize: DeserializeFunc<FinishedProduct<Face>> = Face.serializer().deserialize;

}

Product.Registry.register(Face);

export { Face };
