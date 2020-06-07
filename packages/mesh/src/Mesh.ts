
import { Face } from "./Face";
import { Vector3 } from "./Vector3";
import { Product, Id, FinishedProduct } from "@escad/core";
import { array, Serializer, SerializeFunc, DeserializeFunc } from "tszer";

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
        .map(is => new Face(is.map(i => verts[i])).finish())
    );
  }

  clone(){
    return new Mesh(this.faces.map(f => f.clone().finish()));
  }

  static serializer: () => Serializer<FinishedProduct<Mesh>> = () =>
    array(Face.serializer()).map<FinishedProduct<Mesh>>({
      serialize: mesh => mesh.faces.map(x => x.finish()),
      deserialize: faces => new Mesh(faces).finish(),
    });

  serialize: SerializeFunc<FinishedProduct<Mesh>> = Mesh.serializer().serialize;

  static deserialize: DeserializeFunc<FinishedProduct<Mesh>> = Mesh.serializer().deserialize;

}

Product.Registry.register(Mesh);

export { Mesh };
