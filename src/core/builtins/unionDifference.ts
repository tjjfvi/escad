
import { Element, Operation } from ".";
import { diff } from "./csg";
import { DeepArray } from "../Element";
import { Mesh } from "./Mesh";
import { Leaf } from "../Work";

export const udMeld: Operation<Mesh, Mesh> = new Operation("udMeld", (el: Element<Mesh>) => {
  let args = el.toArrayDeep();
  if (!(args instanceof Array))
    return [[args], []];
  if (args.length === 1)
    [args] = args;
  let dargs: DeepArray<Leaf<Mesh>>[] = [[], []];
  console.log(args)
  for (let arg of args)
    if (arg instanceof Array) {
      dargs[0].push(arg[0]);
      dargs[1].push(...arg.slice(1));
    } else dargs[0].push(arg);
  return dargs;
});

export const unionDiff: Operation<Mesh, Mesh> = new Operation("unionDiff", (el: Element<Mesh>) => {
  console.log(udMeld(el));
  return diff(udMeld(el));
});

export const unionDiffMeld = udMeld;
