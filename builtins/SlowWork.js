
const { Work } = require(".");

class SlowWork extends Work {

  static id="SlowWork";

  async execute(inputs){
    console.log("SlowWork");
    await new Promise(r => setTimeout(r, this.args[0] || 1000));
    return inputs[0];
  }

}

Work.Registry.register(SlowWork);

module.exports = { SlowWork };
