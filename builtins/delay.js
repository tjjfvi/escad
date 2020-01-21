
const { chainables, operators, Component } = require(".");
const { SlowWork } = require("./SlowWork");

chainables.delay = (comp, time) => comp(new SlowWork([comp()], time));
operators.delay = arg => {
  let f = time => comp => new Component(new SlowWork([comp()], time));
  if(typeof arg === "number")
    return f(arg);
  f()(arg);
}
