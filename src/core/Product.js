// @flow

import Registry from "./Registry";
import hash from "./hash";
import b64, { type B64 } from "./b64";
import ProductManager from "./ProductManager";
import Id from "./Id";

class Product {

  static Registry: Registry<typeof Product> = new Registry<typeof Product>("ProductRegistry");

  static id: Id = (null: any);
  static #exportTypes: { [string]: Product => Buffer };

  #sha: ?Buffer;
  #shaB64: ?B64;
  writePromise: Promise<void>;

  get sha(): Buffer{
    let oldSha = this.#sha;
    this.#sha = hash(this.serialize());
    if(oldSha !== this.#sha){
      this.#shaB64 = b64(this.#sha);
      // $FlowFixMe
      this.writePromise = ProductManager.store(this.#shaB64, Promise.resolve(this)).then(() => {});
    }
    // $FlowFixMe
    return this.#sha;
  }

  get shaB64(): B64{
    this.sha;
    // $FlowFixMe
    return this.#shaB64;
  }

  clone(): Product{
    console.warn("Product.clone should be overloaded");
    return this.constructor.deserialize(this.serialize());
  }

  serialize(): Buffer{
    throw new Error("Product.serialize must be overloaded");
  }

  static deserialize(buffer: Buffer): Product{
    throw new Error("Product.deserialize must be overloaded");
  }

  static get exportTypes(): {[string]: Product => Buffer}{
    if(Object.prototype.hasOwnProperty.call(this, "_exportTypes"))
      return this.#exportTypes;
    return this.#exportTypes = {};
  }

  process(): this{
    return this;
  }

  visualize(indent: number = 0){
    console.log("  ".repeat(indent) + " -", this.constructor.name);
  }

}

export default Product;
