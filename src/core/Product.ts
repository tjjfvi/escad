
import Registry from "./Registry";
import { hash, Sha } from "./hash";
import ProductManager from "./ProductManager";
import Id from "./Id";

type _P = Product<_P>;
abstract class Product<P extends Product<P> = _P> {

  abstract type: ProductType<P>;

  static Registry = new Registry<ProductType>("ProductRegistry");

  private static _exportTypes: { [ext: string]: (p: Product) => Buffer };

  private _sha?: Sha;
  writePromise: Promise<void> | undefined;

  get sha(): Sha {
    let oldSha = this._sha;
    this._sha = hash(this.serialize());
    if (oldSha !== this._sha) {
      this.writePromise = ProductManager.store(this._sha, Promise.resolve(this)).then(() => { });
    }
    return this._sha;
  }

  abstract clone(): P;

  abstract serialize(): Buffer;

  static get exportTypes(): { [ext: string]: (p: Product) => Buffer } {
    if (Object.prototype.hasOwnProperty.call(this, "_exportTypes"))
      return this._exportTypes;
    return this._exportTypes = {};
  }

  process(): this {
    return this;
  }

}

export interface ProductType<P extends Product<P> = _P> {
  id: Id;
  deserialize(buffer: Buffer): P
}

export default Product;
