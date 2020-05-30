
import { Work, Id, Operation } from ".";
import { Mesh } from "./Mesh";
import { Leaf } from "../Work";

export class MeldWork extends Work<MeldWork, Mesh, Leaf<Mesh>[]> {
  type = MeldWork;

  static id = new Id("MeldWork", __filename);

  constructor(children: Leaf<Mesh>[]) {
    super(children);
    this.freeze();
  }

  async execute(inputs: Mesh[]) {
    return new Mesh(inputs.flatMap(i => i.faces));
  }

  _serialize() {
    return Buffer.alloc(0);
  }

  static _deserialize(children: Leaf<Mesh>[]) {
    return new MeldWork(children);
  }

}

Work.Registry.register(MeldWork);

export const meld: Operation<Mesh, Mesh> = new Operation("meld", el => new MeldWork(el.toArrayFlat()));
