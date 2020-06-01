
import { Mesh } from "./Mesh";
import { Face } from "./Face";
import { mapOperation } from "./mapOperation";
import { Work, Leaf, Id, Operation } from "@escad/core";

class FlipWork extends Work<FlipWork, Mesh, [Leaf<Mesh>]> {
  type = FlipWork;

  static id = new Id("FlipWork", __filename);

  _serialize() {
    return Buffer.alloc(0);
  }

  static _deserialize([child]: [Leaf<Mesh>]) {
    return new FlipWork(child);
  }

  async execute([input]: [Mesh]) {
    return new Mesh(input.faces.map(f => new Face(f.points.slice().reverse())));
  }

  constructor(child: Leaf<Mesh>) {
    super([child]);
    if (child instanceof FlipWork)
      this.redirect = child.children[0];
    this.freeze()
  }

}

Work.Registry.register(FlipWork);

export const flip: Operation<Mesh, Mesh> = mapOperation<Mesh, Mesh>("flip", leaf => new FlipWork(leaf));

export { FlipWork };
