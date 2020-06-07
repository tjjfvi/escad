
import { Mesh } from "@escad/mesh";
import { Work, Leaf, Id, Operation, ConvertibleTo, FinishedProduct } from "@escad/core";
import { Serializer, SerializeFunc, DeserializeFunc } from "tszer";

export class MeldWork extends Work<MeldWork, Mesh, ConvertibleTo<Mesh>[]> {

  type = MeldWork;

  static id = new Id("MeldWork", __filename);

  constructor(children: Leaf<Mesh>[]){
    super(children);
    this.freeze();
  }

  static serializer: () => Serializer<MeldWork> = () =>
    Work.childrenReference<ConvertibleTo<Mesh>[]>().map<MeldWork>({
      serialize: work => work.children,
      deserialize: children => new MeldWork(children),
    })

  serialize: SerializeFunc<MeldWork> = MeldWork.serializer().serialize;

  static deserialize: DeserializeFunc<MeldWork> = MeldWork.serializer().deserialize;

  clone(children: Leaf<Mesh>[]){
    return new MeldWork(children);
  }

  async execute(rawInputs: FinishedProduct<ConvertibleTo<Mesh>>[]){
    const inputs = await Promise.all(rawInputs.map(i => Mesh.convert(i).process()));
    return new Mesh(inputs.flatMap(i => i.faces)).finish();
  }

}

Work.Registry.register(MeldWork);

export const meld: Operation<Mesh, Mesh> = new Operation("meld", el => new MeldWork(el.toArrayFlat()));
