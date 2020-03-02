
import { Work, Id } from ".";
import { Mesh } from "./Mesh";
import { Face } from "./Face";
import { Vector3 } from "./Vector3";

class PointMapWork extends Work {

  static id = new Id("PointMapWork", __filename);

  execute(inputs){
    let input = inputs[0];
    if(input instanceof Mesh)
      return new Mesh(input.faces.map(f => this.execute([f])));
    if(input instanceof Face)
      return new Face(input.points.map(p => this.execute([p])));
    if(input instanceof Vector3)
      return this.args[0](input);
    throw new Error("Invalid input to PointMapWork");
  }

  transformChildren(children){
    children = super.transformChildren(children);
    if(children.length !== 1)
      throw new Error("PointMapWork only accepts one child");
    let child = children[0];
    if(child instanceof PointMapWork) {
      let oldFunc = this.args[0];
      let childFunc = child.args[0];
      let newArgs = this.args.slice();
      newArgs[0] = x => oldFunc(childFunc(x));
      newArgs.push(...child.args.slice(1));
      this.returnVal = new PointMapWork([child.children[0]], this.hierarchy, ...newArgs);
      return [];
    }
    return [child];
  }

}

Work.Registry.register(PointMapWork);

export { PointMapWork };
