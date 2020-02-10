
const { Work } = require(".");
const { Mesh, Face, Vector3 } = require("./Mesh");

class PointMapWork extends Work {

  static id="PointMapWork";

  static consumer = Symbol("PointMapWork.consumer");

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
      this.args[0] = x => oldFunc(childFunc(x));
      this.args.push(...child.args.slice(1));
      return [child.children[0]];
    }
    if(PointMapWork.consumer in child)
      this.returnVal = child[PointMapWork.consumer](this.args[0]);
    return [child];
  }

}

Work.Registry.register(PointMapWork);

module.exports = { PointMapWork };
