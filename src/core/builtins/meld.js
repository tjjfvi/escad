
const { Work, operators, Component, Hierarchy, arrayish } = require(".");
const { Mesh } = require("./Mesh");

class MeldWork extends Work {

  static id="MeldWork";

  execute(inputs){
    return new Mesh(inputs.flatMap(i => i.faces));
  }

}

Work.Registry.register(MeldWork);

const _meld = (...args) => new MeldWork(arrayish.toArrayDeep(args), new Hierarchy("meld", args));

operators.meld = (...args) =>
  new Component(_meld(...args));

module.exports = { _meld, MeldWork };

