
import { polyhedron } from "../polyhedron";
import { extendBuiltins } from "@escad/core";

const meshBuiltins = {
  polyhedron,
}

type MeshBuiltins = typeof meshBuiltins;

declare global {
  export namespace escad {
    export interface Builtins extends MeshBuiltins { }
  }
}

extendBuiltins(meshBuiltins);
