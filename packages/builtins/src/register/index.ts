
import ".."
import { extendChainables } from "@escad/core"
import chainables from "../chainables"

type Chainables = typeof chainables;

declare global {
  export namespace escad {
    export interface DefaultChainables extends Chainables { }
  }
}

extendChainables(chainables)
