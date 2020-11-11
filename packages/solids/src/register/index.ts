
// import { cyl, cylinder, hollowCyl, hollowCylinder } from "../cyl";
import { cube } from "../cube";
// import { hollowSphere, sphere } from "../sphere";
import { extendBuiltins } from "@escad/core";

const cylBuiltins = {
  // cyl,
  // cylinder,
  // hollowCyl,
  // hollowCylinder,
  cube,
  // hollowSphere,
  // sphere,
}

type CylBuiltins = typeof cylBuiltins;

declare global {
  export namespace escad {
    export interface Builtins extends CylBuiltins { }
  }
}

extendBuiltins(cylBuiltins);
