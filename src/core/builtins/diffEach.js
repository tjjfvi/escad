
const { chainables, operators, arrayish, Component } = require(".");
const { _diff } = require("./csg");

chainables.subEach =
chainables.subtractEach =
chainables.diffEach =
chainables.differenceEach =
  (comp, ...minus) => comp(arrayish.mapDeep(comp(), x => _diff(x, ...minus)));

operators.diffEach =
operators.differenceEach =
  (tree, ...minus) => new Component(arrayish.mapDeep(tree, x => _diff(x, ...minus)));
