
const { Work } = require(".");

class LeafWork extends Work {

  static id="LeafWork";

  execute(){
    return this.args[0];
  }

}

Work.Registry.register(LeafWork)

module.exports = { LeafWork };
