// @flow

import ExtensibleFunction from "./ExtensibleFunction";
import Component from "./Component";
import Element, { Elementish } from "./Element";
import Product from "./Product";

type $T = Component<any, any> | Operation<any, any> | Element<any>;
interface Operation<I extends Product, O extends Product> {
  (...args: Elementish<I>[]): Element<O>,
  <T extends Product>(o: Operation<O, T>): Operation<I, T>,
  <A extends any[], T extends $T>(c: Component<A, T>): Component<A, this extends (x: T) => infer O ? O : never>,
}


class Operation<I, O> extends ExtensibleFunction {

  name: string;

  constructor(name: string, func: (arg: Element<I>) => Elementish<O>) {
    super((...args) => {
      if (args[0] instanceof Operation)
        return new Operation(name + "+" + args[0].name, (...a: any) => args[0](that(...a)));
      if (args[0] instanceof Component)
        return new Component(args[0].name + "+" + name, (...a: any) => (that as any)((args[0](...a) as any)));
      return func(new Element(args));
    })
    let that: Operation<I, O> = (this as any);
    this.name = name;
  }

}

export default Operation;


