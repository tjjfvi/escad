
import ExtensibleFunction from "./ExtensibleFunction";
import Component, { __Component__ } from "./Component";
import Element, { Elementish, __Element__ } from "./Element";
import Product from "./Product";
import * as builtins from "./builtins";
import { __Thing__ } from "./__Thing__";

export class __Operation__<I extends Product, O extends Product> extends __Thing__ {
  declare private __i__: I;
  declare private __o__: O;
};

type OperationIn<I extends Product, O extends Product> = __Element__<I> | __Operation__<O, any> | __Component__<any, OperationIn<I, O>>
type OperationOut<I extends Product, O extends Product, Arg extends OperationIn<I, O>> =
  Arg extends __Element__<I> ? Element<O> :
  Arg extends __Operation__<O, infer T> ? Operation<I, T> :
  Arg extends __Component__<infer A, infer T> ? T extends OperationIn<I, O> ? Component<A, OperationOut<I, O, T>> : never :
  never

export interface Operation<I extends Product, O extends Product> {
  (...args: Elementish<I>[]): Element<O>,
  <T extends Product>(o: Operation<O, T>): Operation<I, T>,
  <A extends any[], T extends OperationIn<I, O>>(c: Component<A, T>): Component<A, OperationOut<I, O, T>>,
}

type B = typeof builtins;

export type _OperationBuiltins<I extends Product, O extends Product> = {
  [K in keyof B]: B[K] extends OperationIn<I, O> ? OperationOut<I, O, B[K]> : never;
}

export interface Operation<I extends Product, O extends Product> extends _OperationBuiltins<I, O> { }

export class Operation<I extends Product, O extends Product> extends __Operation__<I, O> {

  constructor(name: string, func: (arg: Element<I>) => Elementish<O>) {
    super((...args) => {
      if (args[0] instanceof Operation)
        return new Operation(name + "+" + args[0].name, (...a: any) => args[0](that(...a)));
      if (args[0] instanceof Component)
        return new Component(args[0].name + "+" + name, (...a: any) => (that as any)((args[0](...a) as any)));
      return new Element(func(new Element(args)));
    }, {
      get: (target, prop) => {
        if (prop in target)
          return target[prop as keyof typeof target];

        if (!(prop in builtins) || typeof prop === "symbol")
          return;

        const val = builtins[prop as keyof typeof builtins];
        // @ts-ignore
        return this(val);
      }
    }, name)
    let that: Operation<I, O> = (this as any);
  }

}

export default Operation;


