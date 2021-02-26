
import fs from "fs";
import { posix as path } from "path";
import readPkgUp from "read-pkg-up";
import { checkTypeProperty } from "./checkTypeProperty";

const ids = new Map<string, Id>();

export interface Id<P extends string = string, V extends string = string, N extends string = string> {
  readonly type: "Id",
  readonly packageName: P,
  readonly version: V,
  readonly name: N,
  readonly full: `${P}/${V}/${N}`,
}

export const Id = {
  create: <P extends string, V extends string, N extends string>(
    filepath: string,
    packageName: P,
    version: V,
    name: N,
  ): Id<P, V, N> => {
    if(!("mocked" in fs)) {
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
    const full = `${packageName}/${version}/${name}` as `${P}/${V}/${N}`;
    if(ids.has(full))
      throw new Error(`Duplicate ids created under ${full}`);
    const id: Id<P, V, N> = {
      type: "Id",
      packageName,
      name,
      version,
      full,
    };
    ids.set(full, id);
    return id;
  },
  isId: checkTypeProperty<Id>("Id"),
  equal: (a: Id, b: Id) => a.full === b.full
};
