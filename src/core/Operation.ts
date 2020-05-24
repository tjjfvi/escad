
import ExtensibleFunction from "./ExtensibleFunction";
import Component from "./Component";
import Element, { Elementish } from "./Element";
import Product from "./Product";

type OperationIn<I extends Product, O extends Product> = Element<I> | Operation<O, Product> | Component<any, any>;
type OperationRet<I extends Product, O extends Product, A extends OperationIn<I, O>> =
  A extends Element<I> ? Element<O> :
  A extends Operation<O, infer T> ? Operation<I, T> :
  // @ts-ignore
  A extends Component<infer B, infer T> ? Component<B, OperationRet<I, O, T>> :
  never

type $T = Component<any, any> | Operation<any, any> | Element<any>;
interface Operation<I extends Product, O extends Product> {
  (...args: Elementish<I>[]): Element<O>,
  <T extends Product>(o: Operation<O, T>): Operation<I, T>,
  <A extends any[], T extends any>(c: Component<A, T>): Component<A, OperationRet<I, O, T>>,
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


