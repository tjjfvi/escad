
import { hollowSphere, sphere } from "./sphere";
import { extendBuiltins } from "@escad/core";

const sphereBuiltins = {
  sphere,
  hollowSphere
}

type SphereBuiltins = typeof sphereBuiltins;

declare global {
  export namespace escad {
    export interface Builtins extends SphereBuiltins { }
  }
}

extendBuiltins(sphereBuiltins);

export * from "./sphere";
