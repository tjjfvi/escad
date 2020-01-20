
const hash = require("./hash");
const Registry = require("./Registry");
const ObjectManager = require("./ObjectManager");

class Work {

  static Registry = new Registry("WorkRegistry");

  static id = null;

  constructor(children, ...args){
    this.args = this.transformArgs(...args);
    this.children = this.transformChildren(children);
    this.sha = hash(this.serialize());
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

  async process(){
    let memoized = await ObjectManager.lookup(this.sha);
    if(memoized)
      return memoized;
    let inputs = await Promise.all(this.children.map(c => c.process()));
    let result = await this.execute(inputs);
    ObjectManager.store(this.sha, result);
    return result;
  }

}

module.exports = Work;
