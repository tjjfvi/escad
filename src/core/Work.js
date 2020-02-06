
const hash = require("./hash");
const Registry = require("./Registry");
const ProductManager = require("./ProductManager");

class Work {

  static Registry = new Registry("WorkRegistry");

  static id = null;

  constructor(children, ...args){
    this.returnVal = this;
    this.args = this.transformArgs(...args);
    this.children = this.transformChildren(children);
    this.sha = hash(this.serialize());
    Object.freeze(this);
    return this.returnVal;
  }

  serialize(){
    if(this.constructor.id === null)
      throw new Error("Must supply ID to class " + this.constructor.name);
    return [this.constructor.id, this.args, this.children.map(c => c.sha)];
  }

  transformArgs(...args){
    return args;
  }

  transformChildren(children){
    return children.map(c => c.isComponent ? c.tree : c);
  }

  async execute(inputs){
    inputs;
    return null;
  }

  async process(){
    let memoized = await ProductManager.lookup(this.sha);
    if(memoized)
      return memoized;
    let prom = (async () => {
      let inputs = await Promise.all(this.children.map(c => c.process()));
      let result = await this.execute(inputs);
      return result;
    })();
    ProductManager.store(this.sha, prom);
    return await prom;
  }

  visualize(indent = 0){
    console.log("  ".repeat(indent++) + "-", this.constructor.id);
    this.children.map(c => c.visualize(indent))
  }

}

module.exports = Work;
