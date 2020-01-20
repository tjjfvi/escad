
const Object = require("./Object");
const Work = require("./Work");

class Number extends Object {

  static id = "Number";

  construct(n){
    this.n = n;
  }

  serialize(){
    return Buffer.from(this.n.toString());
  }

  static deserialize(buffer){
    return new Number(+buffer.toString("utf8"));
  }

}

class LeafWork extends Work {

  static id="LeafWork";

  execute(){
    return this.args[0];
  }

}

class AddWork extends Work {

  static id="AddWork";

  execute(inputs){
    return new Number([...this.args, ...inputs.map(n => n.n)].reduce((a, b) => a + b, 0));
  }

}

class SlowWork extends Work {

  static id="SlowWork";

  async execute(inputs){
    await new Promise(r => setTimeout(r, this.args[0] || 1000));
    return inputs[0];
  }

}

Work.Registry.register(LeafWork)
Work.Registry.register(AddWork)
Work.Registry.register(SlowWork)
Object.Registry.register(Number);

let test0 = new AddWork([new SlowWork([new AddWork([new LeafWork([], new Number(2)), new LeafWork([], new Number(1))])])], 3);
let test1 = new AddWork([new SlowWork([new AddWork([new LeafWork([], new Number(2)), new LeafWork([], new Number(1))])])], 4);

(async () => {
  console.time("test0");
  console.log(await test0.process());
  console.timeEnd("test0");

  console.time("test1");
  console.log(await test1.process());
  console.timeEnd("test1");
})()
