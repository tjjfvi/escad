

import { polyhedron } from "./polyhedron";
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

// @create-index {"mode":"*"}

export * from './Face';
export * from './Mesh';
export * from './Plane';
export * from './Vector3';
export * from './polyhedron';

