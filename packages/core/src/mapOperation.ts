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

      const output = new Element(flattenedArg).map(func, (eish, old, isLeaf, isRoot) =>
        Hierarchy.create({
          name,
          braceType: "|",
          children: isRoot && !isLeaf ? old.hierarchy.children : [old.hierarchy],
          input: old.hierarchy.fullOutput,
          isOutput: isLeaf,
          output: Hierarchy.from(eish).output,
          fullOutput: isLeaf ? Hierarchy.from(eish).fullOutput : null,
        })
      );

      return output;
    }, overrideHierarchy, hierarchy)
);
