
const hash = require("./hash");
const Registry = require("./Registry");
const ProductManager = require("./ProductManager");
const Hierarchy = require("./Hierarchy");
const Id = require("./Id");
const b64 = require("./b64");
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
    this.sha = hash(this.serialize());
    this.shaB64 = b64(this.sha);
    this.hierarchy = this.hierarchy && this.hierarchy.clone(this.shaB64);
    Object.freeze(this);
    if(this === this.returnVal)
      fs.writeFile(Work.dir + this.shaB64, this.serialize());
    return this.returnVal;
  }

  clone(hierarchy = this.hierarchy){
    return new this.constructor(this.children, hierarchy, ...this.args);
  }

  serializeArgs(){
    return Buffer.from(JSON.stringify(this.args));
  }

  static deserializeArgs(buf){
    return JSON.parse(buf.toString("utf8"));
  }

  serialize(){
    if(this.constructor.id === null)
      throw new Error("Must supply ID to class " + this.constructor.name);
    let childCountBuf = Buffer.alloc(2);
    childCountBuf.writeUInt16LE(this.children.length, 0);
    let argsBuf = this.serializeArgs();
    return Buffer.concat([
      this.constructor.id.sha,
      childCountBuf,
      ...this.children.map(c => c.sha),
      argsBuf,
    ], 32 + 2 + 32 * this.children.length + argsBuf.length);
  }

  static async deserialize(sha){
    sha = b64(sha);
    if(curDeserialize[sha])
      return await curDeserialize[sha];
    return curDeserialize[sha] = (async () => {
      let buf = await fs.readFile(Work.dir + sha);
      let id = buf.slice(0, 32);
      let cl = buf.readUInt16LE(32);
      let c = Array(cl).fill().map((_, i) => buf.slice(32 + 2 + i * 32, 32 + 2 + i * 32 + 32));
      let args = buf.slice(32 + 2 + cl * 32);
      c = await Promise.all(c.map(s => Work.deserialize(b64(s))));
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
