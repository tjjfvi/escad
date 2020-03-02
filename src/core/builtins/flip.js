
const { Work, arrayish, operators, Component, chainables, Id } = require(".");
const { operatorMap } = require("./operatorMap");
const { Mesh, Face } = require("./Mesh");

class FlipWork extends Work {

  static id = new Id("FlipWork", __filename);

  execute(inputs){
    let input = inputs[0];
    if(input instanceof Mesh)
      return new Mesh(input.faces.map(f => this.execute([f])));
    if(input instanceof Face)
      return new Face(input.points.slice().reverse());
    throw new Error("Invalid input to FlipWork");
  }

  transformChildren(children){
    children = super.transformChildren(children);
    if(children.length !== 1)
      throw new Error("FlipWork only accepts one child");
    let child = children[0];
    if(child instanceof FlipWork) {
      this.returnVal = child.children[0].clone(this.hierarchy);
      return [];
    }
    return [child];
  }

}

Work.Registry.register(FlipWork);

const _flip = (...args) => new FlipWork(arrayish.toArrayDeep(args), null);

operators.flip = (...args) => new Component(operatorMap("flip", args, _flip));
chainables.flip = (comp, ...args) => comp(operatorMap("flip", [comp(), ...args], _flip));

module.exports = { FlipWork };
