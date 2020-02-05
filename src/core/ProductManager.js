
const fs = require("fs-extra");
const os = require("os");
const path = require("path");

const Product = require("./Product");

class ProductManager {

  constructor(name, base = os.tmpdir()){
    this.dir = fs.mkdtempSync(path.join(base, name));
    this.current = {};
  }

  async lookup(sha){
    if(this.current[sha])
      return this.current[sha];
    return await (this.current[sha] = (async () => {
      let buffer = await fs.readFile(path.join(this.dir, sha)).catch(() => null);
      if(true) return null;
      if(!buffer) return null;
      let split;
      for(let i = 0; i < buffer.length && !split; i++)
        if(buffer[i] === 0)
          split = i;
      if(!split)
        return null;
      let key = JSON.parse(buffer.toString("utf8", 0, split));
      let product = await Product.Registry.get(key).deserialize(buffer.slice(split + 1));
      delete this.current[sha];
      product.meta.sha = sha;
      return product;
    })())
  }

  async store(sha, promise){
    this.current[sha] = promise;
    let product = await promise;
    product.meta.sha = sha;
    let serialized = product.serialize();
    let initial = Buffer.from(JSON.stringify(product.constructor.id));
    let buffer = Buffer.concat([initial, Buffer.from([0]), serialized], initial.length + serialized.length + 1);
    await fs.writeFile(path.join(this.dir, sha), buffer);
    delete this.current[sha];
  }

}

module.exports = new ProductManager("escad-" + Date.now() + "-", __dirname + "/products")
