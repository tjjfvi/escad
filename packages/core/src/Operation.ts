
import { Elementish, Element } from "./Element";
import { Product } from "./Product";
import { Hierarchy } from "./Hierarchy";
import { checkTypeProperty } from "./checkTypeProperty";
import { ConvertibleTo } from "./Conversions";
import { contextStack } from "./ContextStack";
import { ExtensibleFunction } from "./ExtensibleFunction";

export type ConvertibleOperation<I extends Product, O extends Product> = Operation<ConvertibleTo<I>, ConvertibleTo<O>>;

export interface Operation<I extends Product, O extends Product> {
  readonly type: "Operation",
  readonly func: (arg: Element<I>) => Elementish<O>,
  readonly name: string,
  readonly hierarchy?: Hierarchy,
  readonly overrideHierarchy?: boolean,
  (...args: Elementish<I>[]): Element<O>,
}

export const Operation = {
  create: <I extends Product, O extends Product>(
    name: string,
    func: (arg: Element<I>) => Elementish<O>,
    overrideHierarchy = true,
    hierarchy?: Hierarchy,
  ): Operation<I, O> => {
    const that = Object.assign(
      new ExtensibleFunction(
        (...args: any[]) => {
          let result = Element.create(contextStack.wrap(() => func(Element.create(args))));
          if(overrideHierarchy)
            result = Element.applyHierarchy(result, Hierarchy.create({
              braceType: "|",
              children: [
                hierarchy ?? Hierarchy.create({ name }),
                ...Hierarchy.from(args).children,
              ],
              linkedProducts: result.hierarchy?.linkedProducts,
            }));
          return result;
        },
        {},
        name,
      ),
      {
        type: "Operation" as const,
        func,
        hierarchy,
        overrideHierarchy,
      }
    ) as Operation<I, O>;
    return that;
  },
  applyHierarchy: <I extends Product, O extends Product>(operation: Operation<I, O>, hierarchy: Hierarchy) =>
    Operation.create(operation.name, operation.func, operation.overrideHierarchy, hierarchy),
  isOperation: checkTypeProperty<Operation<any, any>>("Operation"),
}
