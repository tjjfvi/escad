
import { hash, Sha } from "./hash";
import { Registry } from "./Registry";
import { Product, FinishedProduct } from "./Product";
import { Id } from "./Id";
import { WorkManager } from "./WorkManager";
import { StrictLeaf } from "./Leaf";
import { timers } from "./Timer"
import { Serializer, array, DeserializeFunc, SerializeFunc } from "tszer"

export type ProcessedChildren<C extends Product[]> = {
  [K in keyof C]: FinishedProduct<Extract<C[K], Product<any>>>
}

export type Children<C extends Product[]> = {
  [K in keyof C]: StrictLeaf<Extract<C[K], Product<any>>>
}

export type _Work<T extends Product<T> = Product, C extends Product[] = any> = Work<any, T, C>;
export abstract class Work<_W extends Work<_W, T, C>, T extends Product<T> = Product, C extends Product[] = any> {

  abstract type: WorkType<_W, T, C>;

  static readonly Registry = new Registry<WorkType<_Work>>("WorkRegistry");
  static readonly Manager = new WorkManager();

  children: Children<C>;
  sha: Promise<Sha>;
  frozen = false;

  protected redirect: StrictLeaf<T> | null = null;

  writePromise: Promise<void> | null = null;

  constructor(children: Children<C>){
    this.children = children;
    this.sha = null as any;
  }

  freeze(){
    if(this.children.some(c => "redirect" in c && c.redirect))
      this.redirect = this.clone(this.children.map(c => "redirect" in c && c.redirect || c) as any)
    if(this.redirect && "redirect" in this.redirect && this.redirect.redirect)
      this.redirect = this.redirect.redirect;
    if(this.frozen)
      throw new Error("Work.freeze() should only be called once");
    this.sha = Promise.all(this.children.map(c => c.sha)).then(x => {
      timers.workSha.start();
      return hash(Work.Manager.serialize(this)).then(x => {
        timers.workSha.end();
        return x;
      })
    });
    this.frozen = true;
    this.writePromise = this.sha.then(sha => {
      timers.workSerialize.start();
      return sha;
    }).then(sha => Work.Manager.store(sha, this).then(() => {
      timers.workSerialize.end();
    }));
    Object.freeze(this);
  }

  static childrenReference = <C extends Product[]>(): Serializer<Children<C>> =>
    array(Sha.reference().map<StrictLeaf<Product>>({
      serialize: child => child.sha,
      deserialize: async sha => {
        const result = await Work.Manager.lookup(sha) ?? await Product.Manager.lookup(sha);
        if(!result)
          throw new Error(`Could not find leaf with sha ${sha.hex}`);
        return result;
      }
    })) as any

  abstract clone(children: Children<C>): _W

  abstract serialize: SerializeFunc<_W>;

  abstract async execute(inputs: ProcessedChildren<C>): Promise<FinishedProduct<T>>;

  async process(): Promise<FinishedProduct<T>>{
    if(!this.frozen)
      throw new Error("Work must be frozen in the constructor");

    const sha = await this.sha;

    if(this.redirect) {
      await Product.Manager.storePointer(sha, await this.redirect.sha);
      return await this.redirect.process();
    }

    const resultPromise = (async (): Promise<FinishedProduct<T>> => {
      timers.workProcess.start();
      const memoized = await Product.Manager.lookup(sha);
      if(memoized) {
        timers.workProcess.end();
        return memoized as any;
      }

      const inputs: ProcessedChildren<C> = await Promise.all(this.children.map(c => c.process())) as any;
      const alias = this.clone(inputs);
      const aliasSha = await alias.sha;

      const resultPromise = aliasSha.hex === sha.hex ? this.execute(inputs) : alias.process();
      const result = await resultPromise;

      await Product.Manager.storePointer(sha, await result.sha);
      // await result.writePromise;

      timers.workProcess.end();
      return result;
    })()

    Product.Manager.cache.setAsync(sha.hex, () => resultPromise);

    return await resultPromise;
  }

  static getSerializer<W extends Work<W>>(workType: WorkType<W>){
    return new Serializer({
      deserialize: workType.deserialize,
      serialize: (v, wc) => v.serialize(v, wc),
    });
  }

}

export interface WorkType<W extends Work<W, T, C>, T extends Product<T> = Product, C extends Product[] = any> {
  id: Id,
  deserialize: DeserializeFunc<W>,
}
