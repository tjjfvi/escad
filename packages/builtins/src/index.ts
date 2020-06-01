
import * as newBuiltins from "./builtins";
import { extendBuiltins } from "@escad/core";

type NewBuiltins = typeof newBuiltins;

declare global {
  export namespace escad {
    export interface Builtins extends NewBuiltins { }
  }
}

extendBuiltins(newBuiltins);

export * from "./builtins";
