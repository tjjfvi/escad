
import { add, union } from "../union";
import { diff, sub } from "../diff";
import { intersect, intersection } from "../intersection";
import { meld } from "../meld";
import { udMeld, unionDiff, unionDiffMeld } from "../unionDifference";
import { extendBuiltins } from "@escad/core";

const csgBuiltins = {
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

type CsgBuiltins = typeof csgBuiltins;

declare global {
  export namespace escad {
    export interface Builtins extends CsgBuiltins { }
  }
}

extendBuiltins(csgBuiltins);
