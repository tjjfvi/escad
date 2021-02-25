
import { polyhedron } from "../polyhedron";
import { extendChainables } from "@escad/core";

const meshChainables = {
  polyhedron,
}

type MeshChainables = typeof meshChainables;

declare global {
  export namespace escad {
    export interface DefaultChainables extends MeshChainables { }
  }
}

extendChainables(meshChainables);
