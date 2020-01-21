
const { Work } = require(".");
const { Number } = require("./Number");

class AddWork extends Work {

  static id="AddWork";

  execute(inputs){
    console.log("AddWork");
    return new Number([...this.args, ...inputs.map(n => n.n)].reduce((a, b) => a + b, 0));
  }

  transformChildren(children){
    children = super.transformChildren(children);
    return children.flatMap(c => {
      if(c instanceof AddWork) {
        this.args.push(...c.args);
        return c.children;
      }
      return c;
    });
  }

}

Work.Registry.register(AddWork)

module.exports = { AddWork };
