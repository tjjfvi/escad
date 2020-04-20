// @flow

import fs from "fs-extra";
import path from "path";

import Id from "./Id";
import b64, { type B64 } from "./b64";
import Product from "./Product";
import WeakCache from "./WeakCache";

class ProductManager {

  dir: string;
  exportDir: string;
  cache = new WeakCache<B64, ?Product>();

  constructor(){
    this.dir = "";
    this.exportDir = "";
  }

  async lookup(sha: B64){
    return await this.cache.getAsync(sha, async () => {
      let buffer: ?Buffer = await fs.readFile(path.join(this.dir, sha)).catch(() => null);
      if(!buffer)
        return null;
      let id = Id.get(b64(buffer.slice(0, 32)));
      let product = await Product.Registry.get(id).deserialize(buffer.slice(32));
      return product;
    })
  }

  async store(sha: B64, promise: Promise<Product>){
    return this.cache.setAsync(sha, async () => {
      let product = await promise;
      let serialized = product.serialize();
      let initial = product.constructor.id.sha;
      let buffer = Buffer.concat([initial, serialized], 32 + serialized.length);
      await fs.writeFile(path.join(this.dir, sha), buffer);
    });
  }

  async export(sha: B64, format: string){
    let p = await this.lookup(sha);
    if(!p)
      throw new Error(`Product ${sha} not found`);
    let f: ?(Product=>Buffe) = p.constructor.exportTypes[format];
    if(!f)
      throw new Error(`${p.constructor.name} cannot export to ${format}`);
    let b = f(p);
    await fs.writeFile(path.join(this.exportDir, sha + format), b);
  }

}

export default new ProductManager()
