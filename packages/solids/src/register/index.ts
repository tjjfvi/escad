
import "..";
import { extendChainables } from "@escad/core";
import solidsChainables from "../chainables";

type SolidsChainables = typeof solidsChainables;

declare global {
  export namespace escad {
    export interface DefaultChainables extends SolidsChainables { }
  }
}

extendChainables(solidsChainables);
