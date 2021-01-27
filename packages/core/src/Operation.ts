
import { Component, __Component__ } from "./Component";
import { Element, Elementish, __Element__, ArrayElement } from "./Element";
import { Product } from "./Product";
import { __Thing__ } from "./__Thing__";
import { builtins, Builtins } from "./builtins";
import { ConvertibleTo } from "./Conversions";
import { Hierarchy } from "./Hierarchy";

export class __Operation__<I extends Product, O extends Product> extends __Thing__ {

  declare protected __i__: ConvertibleTo<I>;
  declare protected __o__: O;

}

type OperationIn<I extends Product, O extends Product> =
  | __Element__<I>
  | __Operation__<O, any>
  | __Component__<any, OperationIn<I, O>>
type OperationOut<I extends Product, O extends Product, Arg extends OperationIn<I, O>> =
  Arg extends __Element__<I> ? Element<O> :
  Arg extends __Operation__<infer T, I> ? Operation<T, O> :
  Arg extends __Component__<infer A, infer T> ? T extends OperationIn<I, O> ? Component<A, OperationOut<I, O, T>> :
  never : never

export interface Operation<I extends Product, O extends Product> {
  _: this,
  (...args: Elementish<I>[]): Element<O>,
  <T extends Product>(o: Operation<T, I>): Operation<T, O>,
  <A extends any[], T extends OperationIn<I, O>>(c: Component<A, T>): Component<A, OperationOut<I, O, T>>,
}

type _OperationOut<I extends Product, O extends Product, Arg> =
  Arg extends OperationIn<I, O> ? OperationOut<I, O, Arg> : never;

export type _OperationBuiltins<I extends Product, O extends Product> = {
  [K in keyof Builtins]: _OperationOut<I, O, Builtins[K]>;
}

export interface Operation<I extends Product, O extends Product> extends _OperationBuiltins<I, O> { }

export class Operation<I extends Product, O extends Product> extends __Operation__<I, O> {

  constructor(
    name: string,
    func: (arg: ArrayElement<I>) => Elementish<O>,
    overrideHierarchy = true,
    public hierarchy?: Hierarchy,
  ){
    super((...args) => {
      if(args[0] instanceof Operation)
        return new Operation(name + "+" + args[0].name, (a: any) => that(args[0](...a.val)), false);
      if(args[0] instanceof Component)
        return new Component(args[0].name + "+" + name, (...a: any) => (that as any)((args[0](...a) as any)), false);
      const result = new Element(func(Element.create(args)));
      if(overrideHierarchy)
        result.hierarchy = Hierarchy.create({
          braceType: "|",
          children: [
            this.hierarchy ?? Hierarchy.create({ name }),
            ...Hierarchy.fromElementish(args).children,
          ],
          output: result.hierarchy,
        })
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

}


