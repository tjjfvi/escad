
import { cylinder, cyl } from "../cylinder";
import { cube } from "../cube";
import { sphere } from "../sphere";
import { extendBuiltins } from "@escad/core";

const cylBuiltins = {
  cylinder,
  cyl,
  cube,
  sphere,
}

type CylBuiltins = typeof cylBuiltins;

declare global {
  export namespace escad {
    export interface Builtins extends CylBuiltins { }
  }
}

extendBuiltins(cylBuiltins);
