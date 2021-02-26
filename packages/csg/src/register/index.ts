
import "..";
import { extendChainables } from "@escad/core";
import csgChainables from "../chainables"

type CsgChainables = typeof csgChainables;

declare global {
  export namespace escad {
    export interface DefaultChainables extends CsgChainables { }
  }
}

extendChainables(csgChainables);
