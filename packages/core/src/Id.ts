
import { posix as path } from "path";
import readPkgUp from "read-pkg-up";

const ids = new Map<string, Id>();

export interface Id<P extends string = string, V extends string = string, N extends string = string> {
  packageName: P,
  version: V,
  name: N,

  full: string,

  isId: true,
}

export const Id = {
  create: <P extends string, V extends string, N extends string>(
    filepath: string,
    packageName: P,
    version: V,
    name: N,
  ): Id<P, V, N> => {
    if(readPkgUp) {
      const result = readPkgUp.sync({ cwd: path.dirname(filepath) });
      if(!result)
        throw new Error("Could not find package.json from file " + filepath);
      const { packageJson: { name: packageJsonName, version: packageJsonVersion } } = result;
      if(packageName !== packageJsonName)
        throw new Error(
          `Id.create: packageName mismatch; ${packageJsonName} attempted to create an id under ${packageName}`
        )
      if(version.startsWith("v") && version.slice(1) !== packageJsonVersion)
        throw new Error(
          `Id.create: version mismatch; ${packageName}@${packageJsonVersion} attempted to create an id under ${version}`
        );
    }
    const full = `${packageName}/${version}/${name}`.replace(/\//g, "-");
    if(ids.has(full))
      throw new Error(`Duplicate ids created under ${full}`);
    const id: Id<P, V, N> = {
      packageName,
      name,
      version,
      full,
      isId: true,
    };
    ids.set(full, id);
    return id;
  },
  get: getId,
  isId: (arg: any): arg is Id =>
    typeof arg === "object" && arg.isId === true,
};

function getId(id: Id): Id
function getId(full: string): Id
function getId(id: string | Id){
  return ids.get(typeof id === "string" ? id : id.full);
}

