
import { posix as path } from "path";
import { checkTypeProperty } from "./checkTypeProperty";

// Import read-pkg-up if in node, do nothing in webpack & co
const nodeRequire = eval(`typeof require === "undefined" ? () => {} : require`);
const readPkgUp: typeof import("read-pkg-up") | undefined = nodeRequire("read-pkg-up")

const ids = new Map<string, Id>();

export interface Id<
  P extends string = string,
  S extends string = string,
  N extends string = string,
  V extends string = string,
> {
  readonly type: "Id",
  readonly packageName: P,
  readonly scope: S,
  readonly name: N,
  readonly version: V,
  readonly full: string,
}

export type ScopedId<S extends string> = Id<string, S, string, string>

export const Id = {
  create: <P extends string, S extends string, V extends string, N extends string>(
    filepath: string,
    packageName: P,
    scope: S,
    name: N,
    version: V,
  ): Id<P, S, N, V> => {
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
    const full = `${packageName}/${scope}/${name}/${version}` as `${P}/${V}/${N}`;
    if(ids.has(full))
      throw new Error(`Duplicate ids created under ${full}`);
    const id: Id<P, S, N, V> = {
      type: "Id",
      packageName,
      scope,
      name,
      version,
      full,
    };
    ids.set(full, id);
    return id;
  },
  isId: checkTypeProperty.string<Id>("Id"),
  equal: (a: Id, b: Id) => a.full === b.full
};
