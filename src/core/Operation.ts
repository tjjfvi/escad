import { Element, Elementish } from "./Element.ts";
import { Product } from "./Product.ts";
import { Hierarchy, HierarchyProp } from "./Hierarchy.ts";
import { checkTypeProperty } from "./checkTypeProperty.ts";
import { ConvertibleTo } from "./Conversions.ts";
import { contextStack } from "./ContextStack.ts";
import { ExtensibleFunction } from "./ExtensibleFunction.ts";
import { CallHierarchy } from "./CallHierarchy.ts";
import { NameHierarchy } from "./NameHierarchy.ts";
import { Promisish } from "./Promisish.ts";
import { type Hkt } from "./Hkt.ts";

export type ConvertibleOperation<I extends Product, O extends Product> =
  Operation<ConvertibleTo<I>, ConvertibleTo<O>>;

export interface Operation<I extends Product, O extends Product> {
  readonly type: "Operation";
  readonly func: (arg: Element<I>) => Elementish<O>;
  readonly name: string;
  readonly hierarchy?: Hierarchy;
  readonly overrideHierarchy?: boolean;
  readonly showOutput?: boolean;
  (...args: Elementish<I>[]): Element<O>;
}

export interface OperationOptions {
  readonly hierarchy?: HierarchyProp;
  readonly overrideHierarchy?: boolean;
  readonly showOutput?: boolean;
}

export const Operation = {
  create: <I extends Product, O extends Product>(
    name: string,
    func: (arg: Element<I>) => Promisish<Elementish<O>>,
    { hierarchy, overrideHierarchy = true, showOutput = true }:
      OperationOptions = {},
  ): Operation<I, O> => {
    const that = Object.assign(
      new ExtensibleFunction(
        (...args: Elementish<I>[]) => {
          const result = Element.create(
            contextStack.wrap(() => func(Element.create(args))),
          );
          return Element.applyHierarchy(result, createHierarchy(result, args));
        },
        {},
        name,
      ),
      {
        type: "Operation" as const,
        func,
        hierarchy,
        overrideHierarchy,
        showOutput,
      },
    ) as Operation<I, O>;

    return that;

    async function createHierarchy(result: Element<O>, args: Elementish<I>[]) {
      if (!overrideHierarchy) {
        return result.hierarchy;
      }
      return CallHierarchy.create({
        operator: await hierarchy ?? NameHierarchy.create({ name }),
        operands: await Promise.all(args.map((x) => Hierarchy.from(x))),
        result: showOutput ? await result.hierarchy : undefined,
        composable: true,
        linkedProducts: (await Hierarchy.from(result)).linkedProducts,
      });
    }
  },
  applyHierarchy: <I extends Product, O extends Product>(
    operation: Operation<I, O>,
    hierarchy?: HierarchyProp,
  ) =>
    Operation.create(operation.name, operation.func, {
      ...operation,
      hierarchy,
    }),
  isOperation: checkTypeProperty.string<Operation<any, any>>("Operation"),
};

declare const __genericOperation__: unique symbol;

export type GenericOperation<I extends Product, O extends Hkt<I, Product>> =
  & Omit<Operation<I, Hkt.Output<O, I>>, "func">
  & {
    readonly func: <J extends I>(
      arg: Element<J>,
    ) => Elementish<Hkt.Output<O, J>>;
    <J extends I>(...args: Elementish<J>[]): Element<Hkt.Output<O, I>>;
    // Operation shouldn't be assignable to GenericOperation
    readonly [__genericOperation__]: never;
  };

export const GenericOperation = {
  create: <I extends Product, O extends Hkt<I, Product>>(
    name: string,
    func: <J extends I>(arg: Element<J>) => Elementish<Hkt.Output<O, J>>,
    opts?: OperationOptions,
  ): GenericOperation<I, O> =>
    Operation.create<I, Hkt.Output<O, I>>(name, func, opts) as never,
  applyHierarchy: <I extends Product, O extends Hkt<I, Product>>(
    operation: GenericOperation<I, O>,
    hierarchy?: Hierarchy,
  ) =>
    GenericOperation.create<I, O>(operation.name, operation.func, {
      ...operation,
      hierarchy,
    }),
};
