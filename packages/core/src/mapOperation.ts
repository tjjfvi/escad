import { Product } from "./Product";
import { Operation } from "./Operation";
import { Leaf } from "./Work";
import { Hierarchy } from "./Hierarchy";
import { Element, ArrayElement } from "./Element";


export const mapOperation = (
 <I extends Product<I>, O extends Product<O> = I>(name: string, func: (i: Leaf<I>) => Leaf<O>) =>
    new Operation<I, O>(name, arg => {
      const argArr = arg.toArray();
      const shouldFlatten = argArr.length === 1;
      const flatten = (el: ArrayElement<I>) => el.toArray()[0]

      const flattenedArg = shouldFlatten ? flatten(arg) : arg;

      const output = new Element(flattenedArg).map(func, (eish, old, isLeaf, isRoot) =>
        new Hierarchy({
          name,
          braceType: "(",
          children: isRoot && !isLeaf ? old.hierarchy.children : [old.hierarchy],
          input: old.hierarchy.fullOutput,
          isOutput: isLeaf,
          output: Hierarchy.fromElementish(eish).output,
          fullOutput: isLeaf ? Hierarchy.fromElementish(eish).fullOutput : null,
        })
      );

      return output;
    })
);
