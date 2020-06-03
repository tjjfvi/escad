
import { Registry } from "./Registry";
import { hash, Sha } from "./hash";
import { ProductManager } from "./ProductManager";
import { Id } from "./Id";

declare class __FinishedProduct__ { declare private __finished: true; }

export interface _Product extends Product<_Product> { };

export abstract class Product<P extends Product<P> = _Product> {

  abstract type: ProductType<P>;

  static Registry = new Registry<ProductType>("ProductRegistry");
  static Manager = new ProductManager();

  private _sha?: Sha;
  writePromise: Promise<void> | undefined;

  finished = false;

  get sha(): Sha {
    return this.getSha();
  }

  private getSha(): Sha {
    if (this.finished)
      return this._sha as any;
    let oldSha = this._sha;
    this._sha = hash(this.serialize());
    if (oldSha !== this._sha) {
      this.writePromise = Product.Manager.store(this._sha, Promise.resolve(this as any)).then(() => { });
    }
    return this._sha;
  }

  finish(): FinishedProduct<P> {
    if (this.finished)
      return this as any;
    this.getSha();
    this.finished = true;
    Object.freeze(this);
    return this as any;
  }

  abstract clone(): P;

  abstract serialize(): Buffer;


}

// @ts-ignore
Product.prototype.process = function <P>(this: FinishedProduct<P>): Promise<FinishedProduct<P>> {
  if (!this.finished)
    throw new Error("Only finished Products can be .process()-ed");
  return this as any;
}

export type FinishedProduct<P extends Product<P>> = P & {
  finished: true
  process(): Promise<FinishedProduct<P>>;
} & __FinishedProduct__;

export interface ProductType<P extends Product<P> = _Product> {
  id: Id;
  deserialize(buffer: Buffer): P
}
