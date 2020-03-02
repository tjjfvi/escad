
const fs = require("fs-extra");
const path = require("path");

const Id = require("./Id");
const b64 = require("./b64");
const Product = require("./Product");

class ProductManager {

  constructor(){
    this.dir = "";
    this.exportDir = "";
    this.current = {};
  }

  async lookup(sha){
    sha = b64(sha);
    if(this.current[sha])
      return this.current[sha];
    return await (this.current[sha] = (async () => {
      let buffer = await fs.readFile(path.join(this.dir, sha)).catch(() => null);
      if(!buffer) return null;
      let id = Id.get(b64(buffer.slice(0, 32)));
      let product = await Product.Registry.get(id).deserialize(buffer.slice(32));
      delete this.current[sha];
      product.meta.sha = sha;
      return product;
    })())
  }

  async store(sha, promise){
    sha = b64(sha);
    this.current[sha] = promise;
    let product = await promise;
    product.meta.sha = sha;
    let serialized = product.serialize();
    let initial = product.constructor.id.sha;
    let buffer = Buffer.concat([initial, serialized], 32 + serialized.length);
    await fs.writeFile(path.join(this.dir, sha), buffer);
    delete this.current[sha];
  }

  async export(sha, format){
    let p = await this.lookup(sha);
    if(!p)
      throw new Error(`Product ${sha} not found`);
    let f = p.constructor.exportTypes[format];
    if(!f)
      throw new Error(`${p.constructor.name} cannot export to ${format}`);
    let b = f(sha, p);
    await fs.writeFile(path.join(this.exportDir, sha + format), b);
  }

}

module.exports = new ProductManager("escad-" + Date.now() + "-", __dirname + "/products")
