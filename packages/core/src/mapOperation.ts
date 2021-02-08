import { Operation } from "./Operation";
import { Hierarchy } from "./Hierarchy";
import { Element, ArrayElement } from "./Element";
import { ConvertibleTo } from "./Conversions";
import { Product } from "./Product";


export const mapOperation = (
 <I extends Product, O extends Product = I>(
    name: string,
    func: (i: ConvertibleTo<I>) => ConvertibleTo<O>,
    overrideHierarchy = true,
    hierarchy?: Hierarchy,
  ) =>
    new Operation<I, O>(name, arg => {
      const argArr = arg.toArray();
      const shouldFlatten = argArr.length === 1;
      const flatten = (el: ArrayElement<I>) => el.toArray()[0]

      const flattenedArg = shouldFlatten ? flatten(arg) : arg;

      const output = new Element(flattenedArg).map(func).map(x => x, (eish, old, isLeaf, isRoot) =>
        Hierarchy.create({
          braceType: "|",
          children: [Hierarchy.create({ name }), ...(isRoot && !isLeaf ? old.hierarchy.children : [old.hierarchy])],
          linkedProducts: old.hierarchy.linkedProducts,
        })
      );

      return output;
    }, overrideHierarchy, hierarchy)
);
