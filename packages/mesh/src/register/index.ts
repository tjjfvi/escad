
import ".."
import { extendChainables } from "@escad/core";
import meshChainables from "../chainables";

type MeshChainables = typeof meshChainables;

declare global {
  export namespace escad {
    export interface DefaultChainables extends MeshChainables { }
  }
}

extendChainables(meshChainables);
