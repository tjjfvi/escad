
import ExtensibleFunction from "./ExtensibleFunction";
import Component, { __Component__ } from "./Component";
import Element, { Elementish, __Element__ } from "./Element";
import Product from "./Product";
import * as builtins from "./builtins";

export declare class __Operation__<I extends Product, O extends Product> { private __i__: I; private __o__: O; };

type $T = Component<any, any> | Operation<any, any> | Element<any>;
export interface Operation<I extends Product, O extends Product> extends __Operation__<I, O> {
  (...args: Elementish<I>[]): Element<O>,
  <T extends Product>(o: Operation<O, T>): Operation<I, T>,
  <A extends any[]>(c: Component<A, Element<I>>): Component<A, Element<O>>,
  <A extends any[], T extends Product>(c: Component<A, Operation<O, T>>): Component<A, Operation<I, T>>,
}


type B = typeof builtins;

type _OperationBuiltins<I extends Product, O extends Product> = {
  [K in keyof B]: (
    B[K] extends __Operation__<O, infer U> ? Operation<I, U> :
    B[K] extends __Element__<I> ? Element<O> :
    B[K] extends __Component__<infer A, __Operation__<O, infer U>> ? Component<A, Operation<I, U>> :
    B[K] extends __Component__<infer A, __Element__<I>> ? Component<A, Element<O>> :
    never
  )
}

export interface Operation<I extends Product, O extends Product> extends _OperationBuiltins<I, O> { }

export class Operation<I extends Product, O extends Product> extends ExtensibleFunction {

  constructor(name: string, func: (arg: Element<I>) => Elementish<O>) {
    super((...args) => {
      if (args[0] instanceof Operation)
        return new Operation(name + "+" + args[0].name, (...a: any) => args[0](that(...a)));
      if (args[0] instanceof Component)
        return new Component(args[0].name + "+" + name, (...a: any) => (that as any)((args[0](...a) as any)));
      return new Element(func(new Element(args)));
    }, {}, name)
    let that: Operation<I, O> = (this as any);
  }

}

export default Operation;


