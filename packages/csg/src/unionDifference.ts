
import { Mesh } from "@escad/mesh";
import { DeepArray, ArrayElement, Operation, ConvertibleTo } from "@escad/core";
import { Bsp } from "./Bsp";
import { diff } from "./diff";

export const udMeld: Operation<Bsp, Bsp> = (
  new Operation<Bsp, Bsp>("udMeld", (el: ArrayElement<Bsp>) => {
    let oargs = el.toArrayDeep();
    let args = oargs.length === 1 ? oargs[0] : oargs;
    if(!(args instanceof Array))
      return [[args], []];
    let dargs: DeepArray<ConvertibleTo<Mesh>>[] = [[], []];
    for(let arg of args)
      if(arg instanceof Array) {
        dargs[0].push(arg[0]);
        dargs[1].push(...arg.slice(1));
      } else dargs[0].push(arg);
    return dargs;
  })
);

export const unionDiff: Operation<Bsp, Bsp> = (
  new Operation<Bsp, Bsp>("unionDiff", (el: ArrayElement<Bsp>) => diff(udMeld(...el.toArray())))
)

export const unionDiffMeld = udMeld;
