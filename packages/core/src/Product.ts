
import { Registry } from "./Registry";
import { hash, Sha } from "./hash";
import { ProductManager } from "./ProductManager";
import { Id } from "./Id";
import { ConvertibleTo } from "./Conversions";
import { StrictLeaf } from "./Leaf";
import { Elementish } from "./Element";
import { ConversionRegistry } from "./ConversionRegistry";
import { DeserializeFunc, Serializer, WriteChunk } from "tszer";
import { timers } from "./Timer";

export abstract class Product<P extends Product<P> = any> {

  abstract type: ProductType<P>;

  static ConversionRegistry = new ConversionRegistry();
  static Registry = new Registry<ProductType>("ProductRegistry");
  static Manager = new ProductManager();

  private _sha?: Promise<Sha>;
  writePromise: Promise<void> | undefined;

  finished = false;

  get sha(): Promise<Sha>{
    return this.getSha();
  }

  private getSha(): Promise<Sha>{
    if(this.finished)
      return this._sha as any;
    let oldSha = this._sha;
    timers.productSha.start();
    this._sha = hash(Serializer.serialize(Product.getSerializer<P>(this.type), this as any)).then(x => {
      timers.productSha.end();
      return x;
    });
    if(oldSha !== this._sha) {
      this.writePromise = this._sha.then(x => {
        timers.productSerialize.start();
        return x;
      }).then(sha => Product.Manager.store(sha, this as any).then(() => {
        timers.productSerialize.end();
      }));
    }
    return this._sha;
  }

  finish(): FinishedProduct<P>{
    if(this.finished)
      return this as any;
    this.getSha();
    this.finished = true;
    Object.freeze(this);
    return this as any;
  }

  abstract clone(): P;

  abstract serialize(value: P, writeChunk: WriteChunk): Promise<void>;

  protected process(): Promise<FinishedProduct<P>>{
    if(!this.finished)
      throw new Error("Only finished Products can be .process()-ed");
    return this as any;
  }

  static convert<P extends Product<P>, Q extends ConvertibleTo<P> & Product<Q>>(
    this: ProductType<P>,
    q: StrictLeaf<Q>,
  ): StrictLeaf<P>{
    return Product.ConversionRegistry.convertLeaf(this, q);
  }

  static convertElementish<P extends Product<P>, Q extends ConvertibleTo<P> & Product<Q>>(
    this: ProductType<P>,
    q: Elementish<Q>,
  ): Elementish<P>{
    return q as any;
  }

  static getSerializer<P extends Product<P>>(p: ProductType<P>){
    return new Serializer({
      deserialize: p.deserialize,
      serialize: (v, wc) => v.serialize(v, wc),
    });
  }

}

export type FinishedProduct<P extends Product<P>> = P & {
  finished: true,
  process(): Promise<FinishedProduct<P>>,
};

export interface ProductType<P extends Product<P> = any> {
  id: Id,
  deserialize: DeserializeFunc<P>,
}
