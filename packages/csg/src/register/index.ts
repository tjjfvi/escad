
import "../bspMeshConversion";
import { add, union } from "../union";
import { diff, sub } from "../diff";
import { intersect, intersection } from "../intersection";
import { meld } from "../meld";
import { udMeld, unionDiff, unionDiffMeld } from "../unionDifference";
import { extendChainables } from "@escad/core";

const csgChainables = {
  union,
  diff,
  intersect,
  sub,
  add,
  intersection,
  meld,
  udMeld,
  unionDiff,
  unionDiffMeld,
};

type CsgChainables = typeof csgChainables;

declare global {
  export namespace escad {
    export interface DefaultChainables extends CsgChainables { }
  }
}

extendChainables(csgChainables);
