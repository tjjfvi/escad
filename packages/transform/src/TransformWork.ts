
import { PointMapWork } from "./PointMapWork";
import { Matrix4 } from "./Matrix4";
import { Mesh, Vector3 } from "@escad/mesh";
import { FlipWork } from "./flip";
import { Work, Leaf, Id } from "@escad/core";

class TransformWork extends PointMapWork<TransformWork> {
  type = TransformWork;

  static id = new Id("TransformWork", __filename);

  constructor(child: Leaf<Mesh>, public matrix: Matrix4) {
    super([child]);
    if (child instanceof FlipWork)
      this.redirect = new FlipWork(new TransformWork(child.children[0], this.matrix));
    else if (child instanceof TransformWork)
      this.redirect = new TransformWork(child.children[0], this.matrix.multiply(child.matrix));
    this.freeze()
  }

  serialize() {
    return this.matrix.serialize();
  }

  static deserialize([child]: [Leaf<Mesh>], buf: Buffer) {
    let m = Matrix4.deserialize(buf);
    return new TransformWork(child, m);
  }

  map(v: Vector3) {
    return this.matrix.multiplyVector(v);
  }

}

Work.Registry.register(TransformWork);

export { TransformWork };
