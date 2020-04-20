// @flow

import ExtensibleFunction from "./ExtensibleFunction";
import Component from "./Component";
import Element, { type Elementish } from "./Element";

const _Operation = {
  Operation: class <I, O> extends ExtensibleFunction {

    name: string;

    constructor(name: string, func: (arg: Element<I>) => Elementish<O>){
      super((...args) => {
        if(args[0] instanceof Operation)
          return new Operation(name + "+" + args[0].name, (...a: any) => args[0](that(...a)));
        if(args[0] instanceof Component)
          return new Component(args[0].name + "+" + name, (...a: any) => (that: any)((args[0](...a): any)));
        return func(new Element(args));
      })
      let that: Operation<I, O> = (this: any);
      this.name =  name;
    }

  }
}.Operation;

const Operation = (() => {
  declare class Operation<I, O=I> extends _Operation<I, O> {

    (...args: Elementish<I>): Element<O>,
    <T>(Operation<O, T>): Operation<I, T>,
    <A, T>(Component<A, T>): Component<A, $Call<Operation<I, O>, T>>,

  }
  return ((_Operation: any): typeof Operation);
})();

export default Operation;


