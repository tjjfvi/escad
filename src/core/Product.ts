// @flow

import Registry from "./Registry";
import { hash, Sha } from "./hash";
import ProductManager from "./ProductManager";
import Id from "./Id";

abstract class Product {

  static Registry: Registry<typeof Product> = new Registry<typeof Product>("ProductRegistry");

  abstract id: Id;
  static get id() {
    return this.prototype.id;
  }

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

  abstract clone(): this;

  abstract serialize(): Buffer;

  abstract deserialize(buffer: Buffer): Product

  static get exportTypes(): { [ext: string]: (p: Product) => Buffer } {
    if (Object.prototype.hasOwnProperty.call(this, "_exportTypes"))
      return this._exportTypes;
    return this._exportTypes = {};
  }

  process(): this {
    return this;
  }

  visualize(indent: number = 0) {
    console.log("  ".repeat(indent) + " -", this.constructor.name);
  }

}

export default Product;
