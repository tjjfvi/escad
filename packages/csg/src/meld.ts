
import { Mesh } from "@escad/mesh";
import { Work, Leaf, Id, Operation, ConvertibleTo, FinishedProduct } from "@escad/core";

export class MeldWork extends Work<MeldWork, Mesh, ConvertibleTo<Mesh>[]> {

  type = MeldWork;

  static id = new Id("MeldWork", __filename);

  constructor(children: Leaf<Mesh>[]){
    super(children);
    this.freeze();
  }

  clone(children: Leaf<Mesh>[]){
    return new MeldWork(children);
  }

  async execute(rawInputs: FinishedProduct<ConvertibleTo<Mesh>>[]){
    const inputs = await Promise.all(rawInputs.map(i => Mesh.convert(i).process()));
    return new Mesh(inputs.flatMap(i => i.faces)).finish();
  }

  serialize(){
    return Buffer.alloc(0);
  }

  static deserialize(children: Leaf<Mesh>[]){
    return new MeldWork(children);
  }

}

Work.Registry.register(MeldWork);

export const meld: Operation<Mesh, Mesh> = new Operation("meld", el => new MeldWork(el.toArrayFlat()));
