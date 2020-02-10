
const { Work, operators, Component, arrayish } = require(".");
const { Mesh } = require("./Mesh");

class MeldWork extends Work {

  static id="MeldWork";

  execute(inputs){
    return new Mesh(inputs.flatMap(i => i.faces));
  }

}

Work.Registry.register(MeldWork);

operators.meld = (...args) => new Component(new MeldWork(arrayish.toArrayDeep(args)));

module.exports = { MeldWork };

