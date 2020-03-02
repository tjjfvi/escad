
import { chainables, operators, arrayish, Element } from ".";
import { _diff } from "./csg";

chainables.subEach =
chainables.subtractEach =
chainables.diffEach =
chainables.differenceEach =
  (el, ...minus) => el(arrayish.mapDeep(el(), x => _diff(x, ...minus)));

operators.diffEach =
operators.differenceEach =
  (tree, ...minus) => new Element(arrayish.mapDeep(tree, x => _diff(x, ...minus)));
