
import { cube } from "./cube";
import { extendBuiltins } from "@escad/core";

const cubeBuiltins = {
  cube,
}

type CubeBuiltins = typeof cubeBuiltins;

declare global {
  export namespace escad {
    export interface Builtins extends CubeBuiltins { }
  }
}

extendBuiltins(cubeBuiltins);

export * from "./cube";
