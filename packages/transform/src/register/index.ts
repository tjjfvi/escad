
import "..";
import { extendChainables } from "@escad/core";
import transformChainables from "../chainables";

type TransformChainables = typeof transformChainables;

declare global {
  export namespace escad {
    export interface DefaultChainables extends TransformChainables { }
  }
}

extendChainables(transformChainables);
