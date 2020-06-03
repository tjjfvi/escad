
import { hash, Sha } from "./hash";
import { Registry } from "./Registry";
import { Product, FinishedProduct } from "./Product";
import { Id } from "./Id";
import { WorkManager } from "./WorkManager";

export type Leaf<T extends Product<T>> = FinishedProduct<T> | _Work<T>;

export type ProcessedChildren<C extends Product[]> = {
  [K in keyof C]: C[K] extends Product<any> ? FinishedProduct<C[K]> : C[K]
}

export type Children<C extends Product[]> = {
  [K in keyof C]: C[K] extends Product<any> ? Leaf<C[K]> : C[K]
}

export type _Work<T extends Product<T> = Product, C extends Product[] = any> = Work<_Work<T, C>, T, C>;
export abstract class Work<_W extends Work<_W, T, C>, T extends Product<T> = Product, C extends Product[] = any> {

  abstract type: WorkType<_W, T, C>;

  static readonly Registry = new Registry<WorkType<_Work>>("WorkRegistry");
  static readonly Manager = new WorkManager();

  children: Children<C>;
  sha: Sha;
  frozen = false;

  protected redirect: Leaf<T> | null = null;

  writePromise: Promise<void> | null = null;

  constructor(children: Children<C>){
    this.children = children;
    this.sha = null as any;
  }

  freeze(){
    if(this.frozen)
      throw new Error("Work.freeze() should only be called once");
    this.sha = hash(Work.Manager.serialize(this));
    this.frozen = true;
    this.writePromise = Work.Manager.store(this.sha, Promise.resolve(this)).then(() => { })
    Object.freeze(this);
  }

  abstract clone(children: Children<C>): _W

  abstract serialize(): Buffer;

  abstract async execute(inputs: ProcessedChildren<C>): Promise<FinishedProduct<T>>;

  async process(): Promise<FinishedProduct<T>>{
    if(!this.frozen)
      throw new Error("Work must be frozen in the constructor");

    if(this.redirect) {
      await Product.Manager.storePointer(this.sha, this.redirect.sha);
      return await this.redirect.process();
    }

    const memoized = await Product.Manager.lookup(this.sha);
    if(memoized)
      return memoized as any;

    const inputs: ProcessedChildren<C> = await Promise.all(this.children.map(c => c.process())) as any;
    const alias = this.clone(inputs);

    const resultPromise = alias.sha === this.sha ? this.execute(inputs) : alias.process();
    const result = await resultPromise;

    await Product.Manager.storePointer(this.sha, result.sha);
    await result.writePromise;

    return result;
  }

}

export interface WorkType<W extends Work<W, T, C>, T extends Product<T> = Product, C extends Product[] = any> {
  id: Id,
  deserialize(children: Children<C>, buf: Buffer): W,
}
