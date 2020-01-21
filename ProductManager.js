
const fs = require("fs-extra");
const os = require("os");
const path = require("path");

const Product = require("./Product");

class ProductManager {

  constructor(name, base = os.tmpdir()){
    this.dir = fs.mkdtempSync(path.join(base, name));
  }

  async lookup(sha){
    let buffer = await fs.readFile(path.join(this.dir, sha)).catch(() => null);
    if(!buffer) return null;
    let split;
    for(let i = 0; i < buffer.length; i++)
      if(buffer[i] === 0)
        split = i;
    if(!split)
      return null;
    let key = JSON.parse(buffer.toString("utf8", 0, split));
    let product = await Product.Registry.get(key).deserialize(buffer.slice(split + 1));
    return product;
  }

  async store(sha, product){
    let serialized = product.serialize();
    let initial = Buffer.from(JSON.stringify(product.constructor.id));
    let buffer = Buffer.concat([initial, Buffer.from([0]), serialized], initial.length + serialized.length + 1);
    await fs.writeFile(path.join(this.dir, sha), buffer);
  }

}

module.exports = new ProductManager("escad-" + Date.now() + "-", __dirname + "/products")
