import { LeafProduct } from "./LeafProduct";
import { Operation } from "./Operation";
import { Hierarchy } from "./Hierarchy";
import { Element, ArrayElement } from "./Element";
import { ConvertibleTo } from "./Conversions";


export const mapOperation = (
 <I extends LeafProduct, O extends LeafProduct = I>(name: string, func: (i: ConvertibleTo<I>) => ConvertibleTo<O>) =>
    new Operation<I, O>(name, arg => {
      const argArr = arg.toArray();
      const shouldFlatten = argArr.length === 1;
      const flatten = (el: ArrayElement<I>) => el.toArray()[0]

      const flattenedArg = shouldFlatten ? flatten(arg) : arg;

      const output = new Element(flattenedArg).map(func, (eish, old, isLeaf, isRoot) =>
        Hierarchy({
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
