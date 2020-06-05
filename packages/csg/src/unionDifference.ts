
import { diff, CSGWrapper } from "./csg";
import { Mesh } from "@escad/mesh";
import { DeepArray, ArrayElement, Leaf, Operation } from "@escad/core";

export const udMeld: Operation<CSGWrapper, CSGWrapper> = (
  new Operation<CSGWrapper, CSGWrapper>("udMeld", (el: ArrayElement<CSGWrapper>) => {
    let oargs = el.toArrayDeep();
    let args = oargs.length === 1 ? oargs[0] : oargs;
    if(!(args instanceof Array))
      return [[args], []];
    let dargs: DeepArray<Leaf<Mesh>>[] = [[], []];
    for(let arg of args)
      if(arg instanceof Array) {
        dargs[0].push(arg[0]);
        dargs[1].push(...arg.slice(1));
      } else dargs[0].push(arg);
    return dargs;
  })
);

export const unionDiff: Operation<CSGWrapper, CSGWrapper> = (
  new Operation<CSGWrapper, CSGWrapper>("unionDiff", (el: ArrayElement<CSGWrapper>) => diff(udMeld(...el.toArray())))
)

export const unionDiffMeld = udMeld;
