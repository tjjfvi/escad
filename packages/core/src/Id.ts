
import { hash, Sha } from "./hash";
import { posix as path } from "path";
import readPkgUp from "read-pkg-up";
import { B64 } from "./b64";

const ids = new Map<B64, Id>();

export class Id {

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
    let old = ids.get(this.sha.b64);
    if (old)
      throw new Error(`Duplicative Id under sha "${this.sha.b64}"`);
    ids.set(this.sha.b64, this);
  }

  static get(sha: Sha) {
    return ids.get(sha.b64);
  }

  toString() {
    return `${this.packageName}@${this.packageVersion}/${this.filename}/${this.name}`;
  }

}
