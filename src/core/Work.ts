// @flow

import hash from "./hash";
import Registry from "./Registry";
import ProductManager from "./ProductManager";
import Product from "./Product";
import Id from "./Id";
import b64, { B64 } from "./b64";
import WeakCache from "./WeakCache";
// $FlowFixMe
import fs from "fs-extra";

type Leaf<T extends Product> = T | Work<T>;

const cache = new WeakCache<B64, Work<any>>();

type $C = Array<Leaf<Product>>;
abstract class Work<T extends Product, C extends $C = any> {

  static readonly Registry: Registry<typeof Work> = new Registry<typeof Work>("WorkRegistry");
  static dir: string = "";

  abstract id: Id;
  static get id() {
    return this.prototype.id;
  }

  children: C;
  sha: Buffer;
  shaB64: B64;

  protected redirect: Work<T> | null;

  constructor(children: C) {
    this.children = children;
    this.sha = hash(this.serialize());
    this.shaB64 = b64(this.sha);
    Object.freeze(this);
    this.construct();
    fs.writeFile(Work.dir + this.shaB64, this.serialize());
    return cache.get(this.shaB64, () => this);
  }

  construct() { };

  abstract _serialize(): Buffer;
  abstract _deserialize(this: null, children: C, buf: Buffer): Work<T, C>;

  serialize() {
    if (this.id === null)
      throw new Error("Must supply ID to class " + this.constructor.name);
    let childCountBuf = Buffer.alloc(2);
    childCountBuf.writeUInt16LE(this.children.length, 0);
    let argsBuf = this._serialize();
    return Buffer.concat([
      this.id.sha,
      childCountBuf,
      ...this.children.map(c => c.sha),
      argsBuf,
    ], 32 + 2 + 32 * this.children.length + argsBuf.length);
  }

  static async deserialize(sha: string | B64): Promise<Work<any>> {
    sha = b64(sha);
    return await cache.getAsync(sha, async () => {
      let buf = await fs.readFile(Work.dir + sha);
      let id = buf.slice(0, 32);
      let cl = buf.readUInt16LE(32);
      let cb = Array(cl).fill(0).map((_, i) => buf.slice(32 + 2 + i * 32, 32 + 2 + i * 32 + 32));
      let args = buf.slice(32 + 2 + cl * 32);
      let c = await Promise.all(cb.map(s => Work.deserialize(b64(s))));
      let C = Work.Registry.get(Id.get(b64(id)));
      return C.prototype._deserialize.call(null, c, args);
    });
  }

  abstract async execute(inputs: { [k in keyof C]: C[k] extends Leaf<infer O> ? O : never }): Promise<T>;

  async process(): Promise<T> {
    if (this.redirect)
      return await this.redirect.process();
    let memoized = await ProductManager.lookup(this.shaB64);
    if (memoized)
      // @ts-ignore
      return memoized;
    let prom = (async () => {
      let inputs = await Promise.all(this.children.map(c => c.process()));
      // @ts-ignore
      let result = await this.execute(inputs);
      return result;
    })();
    await ProductManager.store(this.shaB64, prom);
    return await prom;
  }

  visualize(indent: number = 0) {
    console.log("  ".repeat(indent++) + "-", this.id);
    this.children.map(c => c.visualize(indent))
  }

}

export default Work;
export type { Leaf };
