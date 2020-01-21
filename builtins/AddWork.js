
const { Work } = require(".");
const { Number } = require("./Number");

class AddWork extends Work {

  static id="AddWork";

  execute(inputs){
    return new Number([...this.args, ...inputs.map(n => n.n)].reduce((a, b) => a + b, 0));
  }

}

Work.Registry.register(AddWork)

module.exports = { AddWork };
