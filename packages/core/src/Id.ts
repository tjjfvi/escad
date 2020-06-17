
import { hash, Sha } from "./hash";
import { posix as path } from "path";
import readPkgUp from "read-pkg-up";
import { Hex } from "./hex";
import { IdManager } from "./IdManager";

const ids = new Map<Hex, Id>();

export class Id {

  static Manager = new IdManager();

  packageName: string;
  packageVersion: string;
  filename: string;
  name: string;
  sha: Sha;

  writePromise: Promise<void>;

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
    this.sha = hash.buffer(this.toString());
    let old = ids.get(this.sha.hex);
    if(old)
      throw new Error(`Duplicative Id under sha "${this.sha.hex}"`);
    ids.set(this.sha.hex, this);
    this.writePromise = Id.Manager.store(this.sha, Promise.resolve(this)).then(() => { });
  }

  static get(sha: Sha){
    return ids.get(sha.hex);
  }

  toString(){
    return `${this.packageName}@${this.packageVersion}/${this.filename}/${this.name}`;
  }

  static reference = () => Sha.reference().map<Id>({
    serialize: id => id.sha,
    deserialize: sha => {
      const id = Id.get(sha);
      if(!id)
        throw new Error(`Could not find id of sha ${sha}`);
      return id;
    }
  })

}
