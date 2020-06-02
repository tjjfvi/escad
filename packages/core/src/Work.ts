
import { hash, Sha } from "./hash";
import { Registry } from "./Registry";
import { Product, FinishedProduct } from "./Product";
import { Id } from "./Id";
import { WorkManager } from "./WorkManager";

export type Leaf<T extends Product<T>> = FinishedProduct<T> | W<T>;

type $C = Array<Leaf<Product>>;
type W<T extends Product<T> = Product, C extends $C = any> = Work<W<T, C>, T, C>;
export abstract class Work<_W extends Work<_W, T, C>, T extends Product<T> = Product, C extends $C = $C> {

  abstract type: WorkType<_W, T, C>;

  static readonly Registry = new Registry<WorkType<W>>("WorkRegistry");
  static readonly Manager = new WorkManager();

  children: C;
  sha: Sha;
  frozen = false;

  protected redirect: Leaf<T> | null = null;

  writePromise: Promise<void> | null = null;

  constructor(children: C) {
    this.children = children;
    this.sha = null as any;
  }

  freeze() {
    if (this.frozen)
      throw new Error("Work.freeze() should only be called once");
    this.sha = hash(Work.Manager.serialize(this));
    this.frozen = true;
    this.writePromise = Work.Manager.store(this.sha, Promise.resolve(this)).then(() => { })
    Object.freeze(this);
  }

  abstract serialize(): Buffer;

  abstract async execute(inputs: { [k in keyof C]: C[k] extends Leaf<infer O> ? FinishedProduct<O> : never }): Promise<FinishedProduct<T>>;

  async process(): Promise<FinishedProduct<T>> {
    if (!this.frozen)
      throw new Error("Work must be frozen in the constructor");

    if (this.redirect) {
      await Product.Manager.storePointer(this.sha, this.redirect.sha);
      return await this.redirect.process();
    }

    let memoized = await Product.Manager.lookup(this.sha);
    if (memoized)
      return memoized as any;

    let inputs = await Promise.all(this.children.map(c => c.process()));
    let result = await this.execute(inputs as any);

    await Product.Manager.storePointer(this.sha, result.sha);
    await result.writePromise;

    return result;
  }

}

export interface WorkType<W extends Work<W, T, C>, T extends Product<T> = Product, C extends $C = any> {
  id: Id;
  deserialize(children: C, buf: Buffer): W;
}
