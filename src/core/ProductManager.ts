// @flow

import fs from "fs-extra";
import path from "path";

import Id from "./Id";
import Product from "./Product";
import WeakCache from "./WeakCache";
import { Sha } from "./hash";

class ProductManager {

  dir: string;
  exportDir: string;
  cache = new WeakCache<string,?Product>();

  constructor() {
    this.dir = "";
    this.exportDir = "";
  }

  async lookup(sha: Sha) {
    return await this.cache.getAsync(sha.b64, async () => {
      let buffer: ?Buffer = await fs.readFile(path.join(this.dir, sha.b64)).catch(() => null);
      if (!buffer)
        return null;
      let id = Id.get(new Sha(buffer.slice(0, 32)));
      let product = await Product.Registry.get(id).deserialize(buffer.slice(32));
      return product;
    })
  }

  async store(sha: Sha, promise: Promise<Product>) {
    return this.cache.setAsync(sha.b64, async () => {
      let product = await promise;
      let serialized = product.serialize();
      let buffer = Buffer.concat([product.id.sha.buffer, serialized], 32 + serialized.length);
      await fs.writeFile(path.join(this.dir, sha.b64), buffer);
      return product;
    });
  }

  async export(sha: B64, format: string) {
    let p = await this.lookup(sha);
    if (!p)
      throw new Error(`Product ${sha} not found`);
    let f: ?(Product=> Buffe) = p.constructor.exportTypes[format];
    if (!f)
      throw new Error(`${p.constructor.name} cannot export to ${format}`);
    let b = f(p);
    await fs.writeFile(path.join(this.exportDir, sha + format), b);
  }

}

export default new ProductManager()
