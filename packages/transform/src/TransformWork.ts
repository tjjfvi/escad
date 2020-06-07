
import { PointMapWork } from "./PointMapWork";
import { Matrix4 } from "./Matrix4";
import { Mesh, Vector3 } from "@escad/mesh";
import { FlipWork } from "./flip";
import { Work, Leaf, Id, ConvertibleTo } from "@escad/core";
import { Serializer, SerializeFunc, DeserializeFunc, concat } from "tszer";

class TransformWork extends PointMapWork<TransformWork> {

  type = TransformWork;

  static id = new Id("TransformWork", __filename);

  constructor(child: Leaf<Mesh>, public matrix: Matrix4){
    super([child]);
    if(child instanceof FlipWork)
      this.redirect = new FlipWork(new TransformWork(child.children[0], this.matrix));
    else if(child instanceof TransformWork)
      this.redirect = new TransformWork(child.children[0], this.matrix.multiply(child.matrix));
    this.freeze()
  }

  clone([child]: [Leaf<Mesh>]){
    return new TransformWork(child, this.matrix);
  }

  static serializer: () => Serializer<TransformWork> = () =>
    concat(
      Work.childrenReference<[ConvertibleTo<Mesh>]>(),
      Matrix4.serializer(),
    ).map<TransformWork>({
      serialize: work => [work.children, work.matrix.finish()],
      deserialize: ([[child], matrix]) => new TransformWork(child, matrix),
    })

  serialize: SerializeFunc<TransformWork> = TransformWork.serializer().serialize;

  static deserialize: DeserializeFunc<TransformWork> = TransformWork.serializer().deserialize;

  map(v: Vector3){
    return this.matrix.multiplyVector(v);
  }

}

Work.Registry.register(TransformWork);

export { TransformWork };
