
import { operators, Element, arrayish, Hierarchy } from ".";
import { _union, _diff } from "./csg";

let _udArgs = (...uargs) => {
  if(arrayish.length(uargs) === 0)
    return;
  if(arrayish.length(uargs) === 1)
    uargs = arrayish.element(uargs, 0);
  let args = arrayish.toArrayDeep(uargs, x => x, false)
  let dargs = [[], []];
  for(let arg of args)
    if(arg instanceof Array) {
      dargs[0].push(arg[0]);
      dargs[1].push(...arg.slice(1));
    } else dargs[0].push(arg);
  return dargs;
}

let _unionDiff = (...uargs) => {
  if(arrayish.length(uargs) === 0)
    return;
  let dargs = _udArgs(...uargs);
  if(arrayish.length(uargs) === 1)
    uargs = arrayish.element(uargs, 0);
  if(dargs.length === 1)
    return new Hierarchy("unionDiff", uargs).apply(_union(...dargs[0]));
  return new Hierarchy("unionDiff", uargs).apply(_diff(...dargs));
}

let _udMeld = (...uargs) => {
  if(arrayish.length(uargs) === 0)
    return;
  let dargs = _udArgs(...uargs);
  if(arrayish.length(uargs) === 1)
    uargs = arrayish.element(uargs, 0);
  if(dargs.length === 1)
    return [dargs[0]];
  return dargs;
}


operators.unionDifference =
operators.unionDiff = (...args) => new Element(_unionDiff(...args));

operators.unionDifferenceMeld =
operators.unionDiffMeld =
operators.udMeld = (...args) => new Element(_udMeld(...args));
