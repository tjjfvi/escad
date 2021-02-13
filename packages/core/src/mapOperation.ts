import { Operation } from "./Operation";
import { Hierarchy } from "./Hierarchy";
import { Element, ArrayElement } from "./Element";
import { Product } from "./Product";


export const mapOperation = (
 <I extends Product, O extends Product = I>(
    name: string,
    func: (i: I) => O,
    overrideHierarchy = true,
    hierarchy?: Hierarchy,
  ) =>
    new Operation<I, O>(name, arg => {
      const argArr = arg.toArray();
      const shouldFlatten = argArr.length === 1;
      const flatten = (el: ArrayElement<I>) => el.toArray()[0]

      const flattenedArg = shouldFlatten ? flatten(arg) : arg;

      const output = new Element(flattenedArg).map(func).map(x => x, (eish, old, isLeaf, isRoot) => {
        const oldHierarchy = Hierarchy.from(old);
        return Hierarchy.create({
          braceType: "|",
          children: [Hierarchy.create({ name }), ...(isRoot && !isLeaf ? oldHierarchy.children : [oldHierarchy])],
          linkedProducts: oldHierarchy.linkedProducts,
        })
      });

      return output;
    }, overrideHierarchy, hierarchy)
);
