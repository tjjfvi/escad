
import { Mesh, Face } from "@escad/mesh";
import { Work, Leaf, Id, Operation, mapOperation, ConvertibleTo, FinishedProduct } from "@escad/core";
import { Serializer, SerializeFunc, DeserializeFunc } from "tszer";

class FlipWork extends Work<FlipWork, Mesh, [ConvertibleTo<Mesh>]> {

  type = FlipWork;

  static id = new Id("FlipWork", __filename);

  static serializer: () => Serializer<FlipWork> = () =>
    Work.childrenReference<[ConvertibleTo<Mesh>]>().map<FlipWork>({
      serialize: flipWork => flipWork.children,
      deserialize: ([child]) => new FlipWork(child),
    })

  serialize: SerializeFunc<FlipWork> = FlipWork.serializer().serialize;

  static deserialize: DeserializeFunc<FlipWork> = FlipWork.serializer().deserialize;

  clone([child]: [Leaf<Mesh>]){
    return new FlipWork(child);
  }

  async execute([input]: [FinishedProduct<ConvertibleTo<Mesh>>]){
    return new Mesh(input.faces.map(f => new Face(f.points.slice().reverse()))).finish();
  }

  constructor(child: Leaf<Mesh>){
    super([child]);
    if(child instanceof FlipWork)
      this.redirect = child.children[0];
    this.freeze()
  }

}

Work.Registry.register(FlipWork);

export const flip: Operation<Mesh, Mesh> = mapOperation<Mesh, Mesh>("flip", leaf => new FlipWork(leaf));

export { FlipWork };
