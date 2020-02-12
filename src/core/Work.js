
const hash = require("./hash");
const Registry = require("./Registry");
const ProductManager = require("./ProductManager");

class Work {

  static Registry = new Registry("WorkRegistry");

  static id = null;

  constructor(children, hierarchy, ...args){
    this.returnVal = this;
    this.hierarchy = hierarchy;
    this.args = this.transformArgs(...args);
    this.children = this.transformChildren(children.map(c => c.isComponent ? c() : c));
    this.sha = hash(this.serialize());
    this.hierarchy = this.hierarchy && this.hierarchy.clone(this.sha);
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
    return children;
  }

  async execute(inputs){
    inputs;
    return null;
  }

  async process(waitStore){
    let memoized = await ProductManager.lookup(this.sha);
    if(memoized)
      return memoized;
    let prom = (async () => {
      let inputs = await Promise.all(this.children.map(c => c.process()));
      let result = await this.execute(inputs);
      return result;
    })();
    let store = ProductManager.store(this.sha, prom);
    if(waitStore)
      await store;
    return await prom;
  }

  visualize(indent = 0){
    console.log("  ".repeat(indent++) + "-", this.constructor.id);
    this.children.map(c => c.visualize(indent))
  }

}

module.exports = Work;
