
import { Vector3 } from "./Vector3";
import { Plane } from "./Plane";
import Product from "../Product";
import Id from "../Id";

class Face extends Product<Face> {

  type = Face;

  static id = new Id("Face", __filename);

  points: Array<Vector3>;
  plane: Plane;

  constructor(points: Array<Vector3>) {
    super();
    if (points.length !== 3)
      throw new Error("Faces can only be triangles");
    this.points = points;
    this.plane = new Plane(points);
  }

  clone() {
    return new Face(this.points.map(p => p.clone()));
  }

  flip() {
    return new Face([...this.points].reverse());
  }

  serialize() {
    return Buffer.concat(this.points.map(p => p.serialize()));
  }

  static deserialize(buf: Buffer) {
    return new Face([...Array(3)].map((_, i) => Vector3.deserialize(buf.slice(i * 12, i * 12 + 12))));
  }

}

Product.Registry.register(Face);

export { Face };
