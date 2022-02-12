import "./mod.ts";
import { extendChainables } from "../core/mod.ts";
import chainables from "./chainables/mod.ts";

type Chainables = typeof chainables;

declare global {
  export namespace escad {
    export interface DefaultChainables extends Chainables {}
  }
}

extendChainables(chainables);
