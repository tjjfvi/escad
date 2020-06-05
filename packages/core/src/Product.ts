
import { Registry } from "./Registry";
import { hash, Sha } from "./hash";
import { ProductManager } from "./ProductManager";
import { Id } from "./Id";
import { ConversionRegistry, ConvertibleTo } from "./Conversions";
import { StrictLeaf } from "./Leaf";
import { Elementish } from "./Element";

export interface _Product extends Product<_Product> { }

export abstract class Product<P extends Product<P> = _Product> {

  abstract type: ProductType<P>;

  static ConversionRegistry = new ConversionRegistry();
  static Registry = new Registry<ProductType>("ProductRegistry");
  static Manager = new ProductManager();

  private _sha?: Sha;
  writePromise: Promise<void> | undefined;

  finished = false;

  get sha(): Sha{
    return this.getSha();
  }

  private getSha(): Sha{
    if(this.finished)
      return this._sha as any;
    let oldSha = this._sha;
    this._sha = hash(this.serialize());
    if(oldSha !== this._sha) {
      this.writePromise = Product.Manager.store(this._sha, Promise.resolve(this as any)).then(() => { });
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

  abstract serialize(): Buffer;

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
    return q;
  }

}

export type FinishedProduct<P extends Product<P>> = P & {
  finished: true,
  process(): Promise<FinishedProduct<P>>,
};

export interface ProductType<P extends Product<P> = _Product> {
  id: Id,
  deserialize(buffer: Buffer): P,
  // convert<Q extends ConvertibleTo<P> & Product<Q>>(q: Q | _Work<Q>): P | _Work<P>,
}
