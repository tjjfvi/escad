
import { Product, Id } from ".";
import { Vector3 } from "./Vector3";
import { Plane } from "./Plane";

class Face extends Product {

  static id = new Id("Face", __filename);

  construct(points){
    if(points.length !== 3)
      throw new Error("Faces can only be triangles");
    this.points = points;
    this.plane = new Plane(points);
  }

  flip(){
    return new Face([...this.points].reverse());
  }

  serialize(){
    return Buffer.concat(this.points.map(p => p.serialize()));
  }

  static deserialize(buf){
    return new Face([...Array(3)].map((_, i) => Vector3.deserialize(buf.slice(i * 12, i * 12 + 12))));
  }

}

Product.Registry.register(Face);

export { Face };
