
import { Elementish, Element } from "./Element"
import { Product } from "./Product"
import { Hierarchy, HierarchyProp } from "./Hierarchy"
import { checkTypeProperty } from "./checkTypeProperty"
import { ConvertibleTo } from "./Conversions"
import { contextStack } from "./ContextStack"
import { ExtensibleFunction } from "./ExtensibleFunction"
import { CallHierarchy } from "./CallHierarchy"
import { NameHierarchy } from "./NameHierarchy"
import { Promisish } from "./Promisish"
import { Hkt } from "./Hkt"

export type ConvertibleOperation<I extends Product, O extends Product> = Operation<ConvertibleTo<I>, ConvertibleTo<O>>

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
  readonly hierarchy?: HierarchyProp,
  readonly overrideHierarchy?: boolean,
  readonly showOutputInHierarchy?: boolean,
}

export const Operation = {
  create: <I extends Product, O extends Product>(
    name: string,
    func: (arg: Element<I>) => Promisish<Elementish<O>>,
    { hierarchy, overrideHierarchy = true, showOutputInHierarchy = true }: OperationOptions = {},
  ): Operation<I, O> => {
    const that = Object.assign(
      new ExtensibleFunction(
        (...args: Elementish<I>[]) => {
          const result = Element.create(contextStack.wrap(() => func(Element.create(args))))
          return Element.applyHierarchy(result, createHierarchy(result, args))
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
    ) as Operation<I, O>

    return that

    async function createHierarchy(result: Element<O>, args: Elementish<I>[]){
      if(!overrideHierarchy)
        return result.hierarchy
      return CallHierarchy.create({
        operator: await hierarchy ?? NameHierarchy.create({ name }),
        operands: await Promise.all(args.map(x => Hierarchy.from(x))),
        result: showOutputInHierarchy ? await result.hierarchy : undefined,
        composable: true,
        linkedProducts: (await Hierarchy.from(result)).linkedProducts,
      })
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
}

export type GenericOperation<I extends Product, O extends Hkt<I, Product>> =
  & Omit<Operation<I, Hkt.Output<O, I>>, "func">
  & {
    readonly func: <J extends I>(arg: Element<J>) => Elementish<Hkt.Output<O, J>>,
    <J extends I>(...args: Elementish<J>[]): Element<Hkt.Output<O, I>>,
    readonly __generic: undefined,
  }

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
    GenericOperation.create<I, O>(operation.name, operation.func, { ...operation, hierarchy }),
}
