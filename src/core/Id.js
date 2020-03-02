// @flow

import hash from "./hash";
import b64 from "./b64";
const path = require("path").posix;
// $FlowFixMe
import readPkgUp from "read-pkg-up";

const ids: {[string]: Id} = {};

class Id {

  packageName: string;
  packageVersion: string;
  filename: string;
  name: string;
  sha: Buffer;
  shaB64: string;


  constructor(name: string, filename: string){
    const result = readPkgUp.sync({ cwd: path.dirname(filename) });
    if(!result)
      throw new Error("Could not find package.json from file " + filename);
    let { packageJson: { name: packageName, version } } = result;
    this.packageName = packageName;
    this.packageVersion = version;
    let packageJsonPath = path.normalize(result.path);
    this.filename = path.relative(path.dirname(packageJsonPath), filename);
    this.name = name;
    this.sha = hash.json(this);
    this.shaB64 = b64(this.sha);
    if(!ids[this.shaB64])
      ids[this.shaB64] = this;
    return ids[this.shaB64];
  }


  static get(sha: string){
    return ids[b64(sha)];
  }

}

export default Id;
