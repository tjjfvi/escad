
import { Face } from "./Face";
import { Vector3 } from "./Vector3";
import { Product, Id } from "@escad/core";
import { array, Serializer, SerializeFunc, DeserializeFunc } from "tszer";
import { registerPlugin } from "@escad/register-client-plugin"

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

  static serializer: () => Serializer<Mesh> = () =>
    array(Face.serializer()).map<Mesh>({
      serialize: mesh => mesh.faces,
      deserialize: faces => new Mesh(faces).finish(),
    });

  serialize: SerializeFunc<Mesh> = Mesh.serializer().serialize;

  static deserialize: DeserializeFunc<Mesh> = Mesh.serializer().deserialize;

}

Product.Registry.register(Mesh);

registerPlugin({
  path: require.resolve("@escad/client-mesh"),
  idMap: { "@escad/client-mesh/Mesh": Mesh.id },
})

export { Mesh };
