
import { hash, Sha } from "./hash";
import Registry from "./Registry";
import ProductManager from "./ProductManager";
import Product from "./Product";
import Id from "./Id";
import WeakCache from "./WeakCache";
// $FlowFixMe
import fs from "fs-extra";
import b64, { B64 } from "./b64";

type Leaf<T extends Product> = T | W<T>;

const cache = new WeakCache<B64, W<any>>();

type $C = Array<Leaf<Product>>;
type W<T extends Product = Product, C extends $C = any> = Work<W<T, C>, T, C>;
abstract class Work<_W extends Work<_W, T, C>, T extends Product = Product, C extends $C = any> {

  abstract type: WorkType<_W, T, C>;

  static readonly Registry = new Registry<WorkType<W>>("WorkRegistry");
  static dir: string = "";

  children: C;
  sha: Sha;
  frozen = false;

  protected redirect: W<T> | null = null;

  constructor(children: C) {
    this.children = children;
    this.sha = null as any;
  }

  freeze(): this {
    if (this.frozen)
      throw new Error("Work.freeze() should only be called once");
    this.sha = hash(this.serialize());
    this.frozen = true;
    Object.freeze(this);
    fs.writeFile(Work.dir + this.sha.b64, this.serialize());
    // @ts-ignore
    return cache.get(this.sha.b64, () => this);
  }

  abstract _serialize(): Buffer;

  serialize(): Buffer {
    let childCountBuf = Buffer.alloc(2);
    childCountBuf.writeUInt16LE(this.children.length, 0);
    let argsBuf = this._serialize();
    return Buffer.concat([
      this.type.id.sha.buffer,
      childCountBuf,
      ...this.children.map(c => c.sha.buffer),
      argsBuf,
    ], 32 + 2 + 32 * this.children.length + argsBuf.length);
  }

  static async deserialize(sha: Sha): Promise<W> {
    return await cache.getAsync(sha.b64, async () => {
      let buf = await fs.readFile(Work.dir + sha);
      let idBuf = buf.slice(0, 32);
      let cl = buf.readUInt16LE(32);
      let cb = Array(cl).fill(0).map((_, i) => buf.slice(32 + 2 + i * 32, 32 + 2 + i * 32 + 32));
      let args = buf.slice(32 + 2 + cl * 32);
      let c = await Promise.all(cb.map(s => Work.deserialize(new Sha(s))));
      let id = Id.get(new Sha(idBuf));
      if (!id)
        throw new Error("Unknown Work Id " + b64(idBuf));
      let C = Work.Registry.get(id);
      return C._deserialize(c, args);
    });
  }

  abstract async execute(inputs: { [k in keyof C]: C[k] extends Leaf<infer O> ? O : never }): Promise<T>;

  async process(): Promise<T> {
    if (this.redirect)
      return await this.redirect.process();
    let memoized = await ProductManager.lookup(this.sha);
    if (memoized)
      // @ts-ignore
      return memoized;
    let prom = (async () => {
      let inputs = await Promise.all(this.children.map(c => c.process()));
      // @ts-ignore
      let result = await this.execute(inputs);
      return result;
    })();
    await ProductManager.store(this.sha, prom);
    return await prom;
  }

}

export interface WorkType<W extends Work<W, T, C>, T extends Product = Product, C extends $C = any> {
  id: Id;
  _deserialize(children: C, buf: Buffer): W;
}

export default Work;
export type { Leaf };
