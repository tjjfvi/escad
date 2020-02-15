
const { operators, Component, arrayish, Hierarchy } = require(".");
const { _union, _diff } = require("./csg");

let _unionDiff = (...uargs) => {
  if(uargs.length === 0)
    return;
  if(uargs.length === 1)
    [uargs] = uargs;
  let args = arrayish.toArrayDeep(uargs, x => x, false)
  let dargs = [[]];
  for(let arg of args)
    if(arg instanceof Array) {
      dargs[0].push(arg[0]);
      dargs.push(...arg.slice(1));
    } else dargs[0].push(arg);
  if(dargs.length === 1)
    return _union(...dargs[0]);
  return new Hierarchy("unionDiff", uargs).apply(_diff(...dargs));
}

operators.unionDifference = operators.unionDiff = (...args) => new Component(_unionDiff(...args));
