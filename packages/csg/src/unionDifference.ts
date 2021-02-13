
import { Mesh } from "@escad/mesh";
import { Operation, ConvertibleOperation, ConvertibleElementish } from "@escad/core";
import { Bsp } from "./Bsp";
import { diff } from "./diff";

export const udMeld: ConvertibleOperation<Bsp, Bsp> = (
  new Operation("udMeld", el => {
    let oargs = el.toArrayDeep();
    let args = oargs.length === 1 ? oargs[0] : oargs;
    if(!(args instanceof Array))
      return [[args], []];
    let dargs: [ConvertibleElementish<Mesh>[], ConvertibleElementish<Mesh>[]] = [[], []];
    for(let arg of args)
      if(arg instanceof Array) {
        dargs[0].push(arg[0]);
        dargs[1].push(...arg.slice(1));
      } else dargs[0].push(arg);
    return dargs;
  })
);

export const unionDiff: ConvertibleOperation<Bsp, Bsp> = (
  new Operation("unionDiff", el => diff(udMeld(...el.toArray())))
)

export const unionDiffMeld = udMeld;
