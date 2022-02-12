import { Mesh } from "../Mesh.ts";
import {
  ConvertibleElementish,
  ConvertibleOperation,
  Element,
  Operation,
} from "../../core/mod.ts";
import { Bsp } from "../Bsp.ts";
import { diff } from "./diff.ts";

export const udMeld: ConvertibleOperation<Bsp, Bsp> = Operation.create(
  "udMeld",
  async (el) => {
    let args = await Element.toArrayDeep(el);
    if (!(args instanceof Array)) {
      return [[args], []];
    }
    let dargs: [ConvertibleElementish<Mesh>[], ConvertibleElementish<Mesh>[]] =
      [[], []];
    for (let arg of args) {
      if (arg instanceof Array) {
        dargs[0].push(arg[0]);
        dargs[1].push(...arg.slice(1));
      } else dargs[0].push(arg);
    }
    return dargs;
  },
);

export const unionDiff: ConvertibleOperation<Bsp, Bsp> = Operation.create(
  "unionDiff",
  async (el) => diff(udMeld(...await Element.toArray(el))),
);

export const unionDiffMeld = udMeld;
