// @flow

import hash from "./hash";
import Registry from "./Registry";
import ProductManager from "./ProductManager";
import Product from "./Product";
import Id from "./Id";
import b64, { type B64 } from "./b64";
import WeakCache from "./WeakCache";
// $FlowFixMe
import fs from "fs-extra";

type Leaf<T: Product> = T | Work<T>;

const cache = new WeakCache<B64, Work<any>>();

type $C = Array<Leaf<Product>>;
class Work<T:Product, C:$C=any> {

  static Registry: Registry<Class<Work<any>>> = new Registry<typeof Work>("WorkRegistry");
  static dir: string = "";

  static id: Id = (null: any);

  children: C;
  sha: Buffer;
  shaB64: B64;
  #redirect: ?Work<T>;

  constructor(children: C){
    this.children = children;
    this.sha = hash(this.serialize());
    this.shaB64 = b64(this.sha);
    Object.freeze(this);
    fs.writeFile(Work.dir + this.shaB64, this.serialize());
    return cache.get(this.shaB64, () => this);
  }

  _serialize(): Buffer{
    return Buffer.alloc(0);
  }

  static _deserialize(children: C, buf: Buffer): Work<T>{
    children; buf;
    throw new Error("Work.deserialize must be overloaded");
  }

  serialize(){
    if(this.constructor.id === null)
      throw new Error("Must supply ID to class " + this.constructor.name);
    let childCountBuf = Buffer.alloc(2);
    childCountBuf.writeUInt16LE(this.children.length, 0);
    let argsBuf = this._serialize();
    return Buffer.concat([
      this.constructor.id.sha,
      childCountBuf,
      ...this.children.map(c => c.sha),
      argsBuf,
    ], 32 + 2 + 32 * this.children.length + argsBuf.length);
  }

  static async deserialize(sha: string | B64): Promise<Work<any>>{
    sha = b64(sha);
    return await cache.getAsync(sha, async () => {
      let buf = await fs.readFile(Work.dir + sha);
      let id = buf.slice(0, 32);
      let cl = buf.readUInt16LE(32);
      let c = Array(cl).fill().map((_, i) => buf.slice(32 + 2 + i * 32, 32 + 2 + i * 32 + 32));
      let args = buf.slice(32 + 2 + cl * 32);
      c = await Promise.all(c.map(s => Work.deserialize(b64(s))));
      let C = Work.Registry.get(Id.get(id));
      // $FlowFixMe
      return C._deserialize(c, args);
    });
  }

  async execute(inputs: $TupleMap<C, <O>(Leaf<O>) => O>): Promise<T>{
    inputs;
    throw new Error("Work.execute must be overloaded");
  }

  async process(): Promise<T>{
    if(this.#redirect)
      return await this.#redirect.process();
    let memoized = await ProductManager.lookup(this.shaB64);
    if(memoized)
      return memoized;
    let prom = (async () => {
      let inputs = await Promise.all(this.children.map(c => c.process()));
      let result = await this.execute(inputs);
      return result;
    })();
    await ProductManager.store(this.sha, prom);
    return await prom;
  }

  visualize(indent: number = 0){
    console.log("  ".repeat(indent++) + "-", this.constructor.id);
    this.children.map(c => c.visualize(indent))
  }

}

export default Work;
export type { Leaf };
