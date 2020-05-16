// @flow

import { hash, Sha } from "./hash";
import b64 from "./b64";
const path = require("path").posix;
// $FlowFixMe
import readPkgUp from "read-pkg-up";

const ids: Record<string, Id> = {};

class Id {

  packageName: string;
  packageVersion: string;
  filename: string;
  name: string;
  sha: Sha;

  constructor(name: string, filename: string) {
    const result = readPkgUp.sync({ cwd: path.dirname(filename) });
    if (!result)
      throw new Error("Could not find package.json from file " + filename);
    let { packageJson: { name: packageName, version } } = result;
    this.packageName = packageName;
    this.packageVersion = version;
    let packageJsonPath = path.normalize(result.path);
    this.filename = path.relative(path.dirname(packageJsonPath), filename);
    this.name = name;
    this.sha = hash.json(this);
    if (!ids[this.sha.b64])
      ids[this.sha.b64] = this;
    return ids[this.sha.b64];
  }


  static get(sha: Sha) {
    return ids[sha.b64];
  }

}

export default Id;
