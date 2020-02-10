
const { operators, Component, arrayish } = require(".");
const { _union, _diff } = require("./csg");

let _unionDiff = (...args) => {
  if(args.length === 0)
    return;
  if(args.length === 1)
    [args] = args;
  args = arrayish.toArrayDeep(args, x => x, false)
  let dargs = [[]];
  for(let arg of args)
    if(arg instanceof Array) {
      dargs[0].push(arg[0]);
      dargs.push(...arg.slice(1));
    } else dargs[0].push(arg);
  if(dargs.length === 1)
    return _union(...dargs[0]);
  return _diff(...dargs);
}

operators.unionDifference = operators.unionDiff = (...args) => new Component(_unionDiff(...args));
