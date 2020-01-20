
const fs = require("fs-extra");
const os = require("os");
const path = require("path");

const Object = require("./Object");

class ObjectManager {

  constructor(name, base = os.tmpdir()){
    this.dir = fs.mkdtempSync(path.join(base, name));
  }

  async lookup(sha){
    let buffer = await fs.readFile(path.join(this.dir, sha)).catch(() => null);
    if(!buffer) return null;
    let split;
    for(let i = 0; i < buffer.length; i++)
      if(buffer[i] === 10)
        split = i;
    if(!split)
      return null;
    let key = JSON.parse(buffer.toString("utf8", 0, split));
    let object = await Object.Registry.get(key).deserialize(buffer.slice(split + 1));
    return object;
  }

  async store(sha, object){
    let serialized = object.serialize();
    let initial = Buffer.from(JSON.stringify(object.constructor.id) + "\n");
    let buffer = Buffer.concat([initial, serialized], initial.length + serialized.length);
    await fs.writeFile(path.join(this.dir, sha), buffer);
  }

}

module.exports = new ObjectManager("escad-" + Date.now() + "-", __dirname + "/objects")
