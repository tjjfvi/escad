
const hash = require("./hash");
const Registry = require("./Registry");
const ProductManager = require("./ProductManager");
const Hierarchy = require("./Hierarchy");
const Id = require("./Id");
const fs = require("fs-extra");

const curDeserialize = {};

class Work {

  static Registry = new Registry("WorkRegistry");
  static dir = "";

  static id = null;

  constructor(children, hierarchy, ...args){
    this.returnVal = this;
    this.hierarchy = hierarchy;
    this.args = this.transformArgs(...args);
    this.children = this.transformChildren(children.map(c => c.isComponent ? c() : c));
    this.sha = hash.json.hex(this.serialize());
    this.hierarchy = this.hierarchy && this.hierarchy.clone(this.sha);
    Object.freeze(this);
    if(this === this.returnVal)
      fs.writeFile(Work.dir + this.sha, JSON.stringify(this.serialize()));
    return this.returnVal;
  }

  clone(hierarchy = this.hierarchy){
    return new this.constructor(this.children, hierarchy, ...this.args);
  }

  serializeArgs(){
    return this.args;
  }

  static deserializeArgs(args){
    return args;
  }

  serialize(){
    if(this.constructor.id === null)
      throw new Error("Must supply ID to class " + this.constructor.name);
    return [
      this.constructor.id.sha,
      this.children.map(c => c.sha),
      this.serializeArgs(),
    ];
  }

  static async deserialize(sha){
    if(curDeserialize[sha])
      return await curDeserialize[sha];
    return curDeserialize[sha] = (async () => {
      let [id, c, args] = JSON.parse(await fs.readFile(Work.dir + sha, "utf8"));
      c = await Promise.all(c.map(s => Work.deserialize(s)));
      let C = Work.Registry.get(Id.get(id));
      args = C.deserializeArgs(args);
      delete curDeserialize[sha];
      return new C(c, null, ...args);
    })();
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

  async process(waitStore = true){
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

  get [Hierarchy.symbol](){
    return this.hierarchy;
  }

  [Hierarchy.apply](hierarchy){
    return this.clone(hierarchy);
  }

}

module.exports = Work;
