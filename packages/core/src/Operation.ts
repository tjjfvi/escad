
import { Component, ComponentConstraint } from "./Component";
import { Element, Elementish, ElementConstraint, ArrayElement } from "./Element";
import { Product } from "./Product";
import { builtins, Builtins } from "./builtins";
import { Hierarchy } from "./Hierarchy";
import { ExtensibleFunction } from "./ExtensibleFunction";
import { checkTypeProperty } from "./checkTypeProperty";
import { ConvertibleTo } from "./Conversions";

export type ConvertibleOperation<I extends Product, O extends Product> = Operation<ConvertibleTo<I>, ConvertibleTo<O>>;
export type ConvertibleOperationConstraint<I extends Product, O extends Product> =
  OperationConstraint<ConvertibleTo<I>, ConvertibleTo<O>>;

export interface OperationConstraint<I extends Product, O extends Product> {
  readonly type: "Operation",
  readonly func: (arg: ArrayElement<I>) => Elementish<O>,
  readonly name: string,
  readonly hierarchy?: Hierarchy,
  readonly overrideHierarchy?: boolean,
}

export const OperationConstraint = {
  isOperationConstraint: checkTypeProperty<OperationConstraint<any, any>>("Operation"),
}


type OperationOut<I extends Product, O extends Product, Arg> =
  // [I, O] extends [infer I, infer O] ?
    [I] extends [Product] ? [O] extends [Product] ?
      Arg extends ElementConstraint<infer I_>
        ? [I_] extends [I]
          ? Element<O>
          : never
        : Arg extends OperationConstraint<infer T, I>
          ? Operation<T, O>
          : Arg extends ComponentConstraint<infer A, infer T>
            ? never
            | Component<A, OperationOut<Extract<I, Product>, Extract<O, Product>, T>>
            : never
    : never : never
  // : never

export interface Operation<I extends Product, O extends Product> {
  _: this,
  (...args: Elementish<I>[]): Element<O>,
  <A>(o: A): OperationOut<I, O, A>,
}

export type _OperationBuiltins<I extends Product, O extends Product> = {
  [K in keyof Builtins]: OperationOut<I, O, Builtins[K]>;
}

export interface Operation<I extends Product, O extends Product> extends _OperationBuiltins<I, O> { }

export class Operation<I extends Product, O extends Product>
  extends ExtensibleFunction implements OperationConstraint<I, O> {

  readonly type = "Operation";

  constructor(
    name: string,
    public readonly func: (arg: ArrayElement<I>) => Elementish<O>,
    public readonly overrideHierarchy = true,
    public readonly hierarchy?: Hierarchy,
  ){
    super((...args) => {
      if(args[0] instanceof Operation)
        return new Operation(name + "+" + args[0].name, (a: any) => that(args[0](...a.val)) as any, false);
      if(args[0] instanceof Component)
        return new Component(args[0].name + "+" + name, (...a: any) => (that as any)((args[0](...a) as any)), false);
      let result = new Element(func(Element.create(args)));
      if(overrideHierarchy)
        result = result.applyHierarchy(Hierarchy.create({
          braceType: "|",
          children: [
            this.hierarchy ?? Hierarchy.create({ name }),
            ...Hierarchy.from(args).children,
          ],
          linkedProducts: result.hierarchy?.linkedProducts,
        }));
      return result;
    }, {
      get: (target, prop) => {
        if(prop === "_") return this;

        if(prop in target)
          return target[prop as keyof typeof target];

        if(!(prop in builtins) || typeof prop === "symbol")
          return;

        const val = builtins[prop as keyof typeof builtins];
        return this(val);
      }
    }, name)
    let that: Operation<I, O> = (this as any);
  }

  applyHierarchy(hierarchy: Hierarchy){
    return new Operation(this.name, this.func, this.overrideHierarchy, hierarchy);
  }

  static fromOperationConstraint<I extends Product, O extends Product>(operation: OperationConstraint<I, O>){
    return new Operation(operation.name, operation.func, operation.overrideHierarchy, operation.hierarchy);
  }

  static isOperation(value: unknown): value is Operation<any, any>{
    return OperationConstraint.isOperationConstraint(value) && value instanceof Operation;
  }

}


