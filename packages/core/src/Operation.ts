
import { Elementish, Element } from "./Element";
import { Product } from "./Product";
import { Hierarchy } from "./Hierarchy";
import { checkTypeProperty } from "./checkTypeProperty";
import { ConvertibleTo } from "./Conversions";
import { contextStack } from "./ContextStack";
import { ExtensibleFunction } from "./ExtensibleFunction";
import { CallHierarchy } from "./CallHierarchy";
import { NameHierarchy } from "./NameHierarchy";

export type ConvertibleOperation<I extends Product, O extends Product> = Operation<ConvertibleTo<I>, ConvertibleTo<O>>;

export interface Operation<I extends Product, O extends Product> {
  readonly type: "Operation",
  readonly func: (arg: Element<I>) => Elementish<O>,
  readonly name: string,
  readonly hierarchy?: Hierarchy,
  readonly overrideHierarchy?: boolean,
  readonly showOutputInHierarchy?: boolean,
  (...args: Elementish<I>[]): Element<O>,
}

export interface OperationOptions {
  readonly hierarchy?: Hierarchy,
  readonly overrideHierarchy?: boolean,
  readonly showOutputInHierarchy?: boolean,
}

export const Operation = {
  create: <I extends Product, O extends Product>(
    name: string,
    func: (arg: Element<I>) => Elementish<O>,
    { hierarchy, overrideHierarchy = true, showOutputInHierarchy = true }: OperationOptions = {},
  ): Operation<I, O> => {
    const that = Object.assign(
      new ExtensibleFunction(
        (...args: any[]) => {
          const result = Element.create(contextStack.wrap(() => func(Element.create(args))));
          const resultHierarchy = result.hierarchy;
          let outputHierarchy = resultHierarchy;
          if(overrideHierarchy)
            outputHierarchy = CallHierarchy.create({
              operator: hierarchy ?? NameHierarchy.create({ name }),
              operands: args.map(x => Hierarchy.from(x)),
              result: resultHierarchy && showOutputInHierarchy ? resultHierarchy : undefined,
              composable: true,
              linkedProducts: Hierarchy.from(result).linkedProducts,
            });
          return Element.applyHierarchy(result, outputHierarchy);
        },
        {},
        name,
      ),
      {
        type: "Operation" as const,
        func,
        hierarchy,
        overrideHierarchy,
        showOutputInHierarchy,
      },
    ) as Operation<I, O>;
    return that;
  },
  applyHierarchy: <I extends Product, O extends Product>(operation: Operation<I, O>, hierarchy?: Hierarchy) =>
    Operation.create(operation.name, operation.func, {
      ...operation,
      hierarchy,
    }),
  isOperation: checkTypeProperty.string<Operation<any, any>>("Operation"),
}
