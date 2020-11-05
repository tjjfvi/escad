
import { posix as path } from "path";
import readPkgUp from "read-pkg-up";

const ids = new Map<string, Id>();

type UniqueSymbolContraint<T> = T extends symbol ? symbol extends T ? "unique symbol" : T : symbol;

export interface Id<T = any, S extends symbol = symbol> {
  __t__?: T,
  __symb__?: S,

  packageName: string,
  packageVersion?: string,
  forcedVersion?: string,
  name: string,

  full: string,

  isId: true,
}

export const Id = Object.assign(
  <S extends UniqueSymbolContraint<S2>, T = any, S2 = S>(
    name: string,
    filepath: string,
    forcedVersion?: string,
  ): Id<T, Extract<S2, symbol>> => {
    const result = readPkgUp.sync({ cwd: path.dirname(filepath) });
    if(!result)
      throw new Error("Could not find package.json from file " + filepath);
    const { packageJson: { name: packageName, version: packageVersion } } = result;
    const full = (
      forcedVersion ?
        `${packageName}/${name}/${forcedVersion}` :
        `${packageName}/${packageVersion}/${name}`
    ).replace("/", "-");
    if(ids.has(full))
      throw new Error(`Duplicate ids created under ${full}`);
    const id: Id<T, Extract<S2, symbol>> = {
      packageName,
      name,
      full,
      isId: true,
      ...(forcedVersion ? { forcedVersion } : { packageVersion }),
    };
    ids.set(full, id);
    return id;
  },
  {
    get: getId,
    isId: (arg: any): arg is Id =>
      typeof arg === "object" && arg.isId === true,
  }
);

function getId(id: Id): Id
function getId(full: string): Id
function getId(id: string | Id){
  return ids.get(typeof id === "string" ? id : id.full);
}

