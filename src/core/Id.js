
const hash = require("./hash");
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
    this.filename = path.relative(packageJsonPath, filename);
    this.name = name;
    this.sha = hash.json.hex(this);
    if(!ids[this.sha])
      ids[this.sha] = this;
    return ids[this.sha];
  }


  static get(sha){
    return ids[sha];
  }

}

module.exports = Id;
