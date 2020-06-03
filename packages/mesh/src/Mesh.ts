
import { Face } from "./Face";
import { Vector3 } from "./Vector3";
import { Product, Id } from "@escad/core";

class Mesh extends Product<Mesh> {

  type = Mesh;

  static id = new Id("Mesh", __filename);

  faces: Array<Face>;

  constructor(faces: Array<Face>){
    super();
    this.faces = faces;
  }

  static fromVertsFaces(verts: Vector3[], faces: number[][]){
    return new Mesh(
      faces
        .flatMap(f => f.slice(2).map((_, i) => [f[0], f[i + 1], f[i + 2]]))
        .map(is => new Face(is.map(i => verts[i])))
    );
  }

  clone(){
    return new Mesh(this.faces.map(f => f.clone()));
  }

  serialize(){
    return Buffer.concat(this.faces.flatMap(f => f.serialize()));
  }

  static deserialize(buf: Buffer){
    const length = 4 * 3 * 3;
    let ind = 0;
    let faces: Array<Face> = [];
    while(ind < buf.length)
      faces.push(Face.deserialize(buf.slice(ind, ind += length)));
    return new Mesh(faces);
  }

}

Product.Registry.register(Mesh);

export { Mesh };
