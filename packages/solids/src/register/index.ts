
import { cylinder, cyl } from "../cylinder";
import { cube } from "../cube";
import { sphere } from "../sphere";
import { extendChainables } from "@escad/core";

const cylChainables = {
  cylinder,
  cyl,
  cube,
  sphere,
}

type CylChainables = typeof cylChainables;

declare global {
  export namespace escad {
    export interface Chainables extends CylChainables { }
  }
}

extendChainables(cylChainables);
