
import { posix as path } from "path";
import readPkgUp from "read-pkg-up";

const ids = new Map<string, Id<symbol>>();

type UniqueSymbolContraint<T> = T extends symbol ? symbol extends T ? "unique symbol" : T : symbol;

export interface Id<T extends symbol = symbol> {
  __symb__?: T,

  packageName: string,
  packageVersion: string,
  filename: string,
  name: string,

  full: string,
}

export const Id = Object.assign(
  <T extends UniqueSymbolContraint<U>, U = T>(name: string, filepath: string): Id<Extract<U, symbol>> => {
    const result = readPkgUp.sync({ cwd: path.dirname(filepath) });
    if(!result)
      throw new Error("Could not find package.json from file " + filepath);
    const { packageJson: { name: packageName, version: packageVersion } } = result;
    const packageJsonPath = path.normalize(result.path);
    const filename = path.relative(path.dirname(packageJsonPath), filepath);
    const full = `${packageName}@${packageVersion}/${filename}/${name}`;
    if(ids.has(full))
      throw new Error(`Duplicate ids created under ${full}`);
    const id: Id<Extract<U, symbol>> = {
      packageName,
      packageVersion,
      filename,
      name,
      full,
    };
    ids.set(full, id);
    return id;
  },
  {
  // Manager: new IdManager(),
    get: getId,
  }
);

function getId(id: Id): Id
function getId(full: string): Id
function getId(id: string | Id){
  return ids.get(typeof id === "string" ? id : id.full);
}

