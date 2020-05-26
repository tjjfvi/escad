
import ExtensibleFunction from "./ExtensibleFunction";
import { Leaf } from "./Work";
import Hierarchy from "./Hierarchy";
import Operation, { __Operation__ } from "./Operation";
import Component, { __Component__ } from "./Component";
import Product from "./Product";
import * as builtins from "./builtins";
import { inspect } from "util";

interface ObjMap<T> {
  [x: string]: T;
}
const isObjMap = (o: unknown): o is ObjMap<unknown> => typeof o === "object" && o?.constructor === Object;

type ElementishFlat<T> = Array<T> | ObjMap<T>;
type Elementish<T extends Product> = Array<Elementish<T>> | ObjMap<Elementish<T>> | Leaf<T> | Element<T>;
type DeepArray<T> = Array<T | DeepArray<T>>;

export declare class __Element__<T extends Product> { private __t__: T; };

export interface Element<T extends Product> extends __Element__<T> {
  (): Element<T>,
  <U extends Product>(o: Operation<T, U>): Operation<T, U>,
  <I extends any[], U extends Product>(c: Component<I, Operation<T, U>>): Component<I, Operation<T, U>>,
}

type B = typeof builtins;

type _ElementBuiltins<T extends Product> = {
  [K in keyof B]: (
    B[K] extends Operation<T, infer U> ? Operation<T, U> :
    B[K] extends Component<infer A, Operation<T, infer U>> ? Component<A, Operation<T, U>> :
    never
  )
}

export interface Element<T extends Product> extends _ElementBuiltins<T> { }

export class Element<T extends Product> extends ExtensibleFunction {

  val: ElementishFlat<Element<T>> | Leaf<T>;
  hierarchy: Hierarchy;

  constructor(c: Elementish<T>, h: Hierarchy = Hierarchy.fromElementish(c as Elementish<Product>)) {
    super(arg => {
      if (!arg)
        return that;
      if (arg instanceof Operation)
        return new Operation(arg.name, a => arg(this, a));
      if (arg instanceof Component)
        return new Component<any, any>(arg.name + "'", (...args) => that(arg(...args)))
      console.log(arg, arg instanceof Operation)
      throw new Error("Invalid argument to Element");
    }, {
      get: (target, prop) => prop in target ? target[prop as keyof typeof target] : (() => {
        if (!(prop in builtins) || typeof prop === "symbol")
          return;
        const val = builtins[prop as keyof typeof builtins];
        console.log(prop, val);
        // @ts-ignore
        return this(val);
      })()
    })
    let that = this;
    if (c instanceof Array)
      this.val = c.map(x => new Element(x));
    else if (isObjMap(c))
      this.val = Object.assign(Object.create(null), ...Object.entries(c).map(([k, v]) => ({ [k]: new Element(v) })));
    else if (c instanceof Element)
      this.val = c.val;
    else
      this.val = c;
    this.hierarchy = h;

    console.log(this, this === undefined)
  }

  map<U extends Product>(f: (x: Leaf<T>) => Elementish<T>): Element<U> {
    if (this.val instanceof Array)
      return new Element<U>(this.val.map(v => v.map<U>(f)));
    if (this.val && this.val.constructor === Object)
      return new Element<U>(Object.assign({}, ...Object.entries(this.val).map(([k, v]) => ({
        [k]: v instanceof Element ? v.map<U>(f) : v,
      }))));
    else
      // @ts-ignore
      return new Element(f(this.val));
  }

  toArray(): Array<Element<T>> | Leaf<T> {
    if (this.val instanceof Array)
      return this.val;
    if (this.val.constructor === Object)
      return Object.values(this.val);
    // @ts-ignore
    return this.val;
  }

  toArrayDeep(): DeepArray<Leaf<T>> | Leaf<T> {
    let arr = this.toArray();
    return (arr instanceof Array ? arr.map(e => e.toArrayDeep()) : arr);
  }

  toArrayFlat(): Array<Leaf<T>> {
    let arr = this.toArray();
    return (arr instanceof Array ? arr.flatMap(e => e.toArrayFlat()) : [arr]);
  }

}

export default Element;
export type { Elementish };
