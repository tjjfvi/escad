
import { cyl, cylinder, hollowCyl, hollowCylinder } from "./cyl";
import { extendBuiltins } from "@escad/core";

const cylBuiltins = {
  cyl,
  cylinder,
  hollowCyl,
  hollowCylinder,
}

type CylBuiltins = typeof cylBuiltins;

declare global {
  export namespace escad {
    export interface Builtins extends CylBuiltins { }
  }
}

extendBuiltins(cylBuiltins);

export * from "./cyl";
