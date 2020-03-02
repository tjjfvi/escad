
const hash = require("./hash");
const b64 = require("./b64");
const path = require("path").posix;
const readPkgUp = require("read-pkg-up");

const ids = {};

class Id {

  constructor(name, filename){
    const result = readPkgUp.sync({ cwd: path.dirname(filename) });
    if(!result)
      throw new Error("Could not find package.json from file " + filename);
    ({ packageJson: { name: this.packageName, version: this.packageVersion } } = result);
    let packageJsonPath = path.normalize(result.path);
    this.filename = path.relative(path.dirname(packageJsonPath), filename);
    this.name = name;
    this.sha = hash.json(this);
    this.shaB64 = b64(this.sha);
    if(!ids[this.shaB64])
      ids[this.shaB64] = this;
    console.log(this);
    return ids[this.shaB64];
  }


  static get(sha){
    return ids[b64(sha)];
  }

}

module.exports = Id;
