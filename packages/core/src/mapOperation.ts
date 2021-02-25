import { Hierarchy } from "./Hierarchy";
import { Operation } from "./Operation";
import { Product } from "./Product";
import { Element } from "./Element";


export const mapOperation = (
 <I extends Product, O extends Product = I>(
    name: string,
    func: (i: I) => O,
    overrideHierarchy = true,
    hierarchy?: Hierarchy,
  ) =>
    Operation.create<I, O>(name, arg => {
      const argArr = Element.toArray(arg);
      const flattenedArg = argArr.length === 1 ? argArr[0] : arg;

      const output = Element.map(Element.map(flattenedArg, func), x => x, (eish, old, isLeaf, isRoot) => {
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
