
import { Hierarchy, Component, arrayish } from ".";

const operatorMap = (name, tree, f) => {
  let obj = arrayish.mapDeep(tree, c => f(c).clone(new Hierarchy(name, [c])));
  obj = new Hierarchy(name, tree, false, arrayish.toArrayDeep(obj, v => v.hierarchy.shas)).apply(obj);
  return new Component(obj);
};

export { operatorMap };
