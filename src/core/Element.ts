// @flow

import ExtensibleFunction from "./ExtensibleFunction";
import { type Leaf } from "./Work";
import Hierarchy from "./Hierarchy";
import Operation from "./Operation";
import Component from "./Component";
import Product from "./Product";

type ElementishFlat<T> = Array<T> | { [string]: T };
type Elementish<T> = ElementishFlat<Elementish<T>> | Leaf<T> | Element<T>;

type DeepArray<T> = Array<T | DeepArray<T>>;

const _Element = {
  Element: class <T: Product> extends ExtensibleFunction {

    val: ElementishFlat<Element<T>> | Leaf<T>;
    hierarchy: Hierarchy;

    constructor(c: Elementish<T>, h: Hierarchy = new Hierarchy(c)){
      super(arg => {
        if(!arg)
          return that;
        if(arg instanceof Operation || arg instanceof Component)
          return arg(that);
        if(arg instanceof Component)
          return new Component<any, any>(arg.name + "'", (...args) => that(arg(...args)))
        throw new Error("Invalid argument to Element");
      })
      let that/* : Element<T> */ = (this: any);
      if(c instanceof Array)
        this.val = c.map(x => new Element(x));
      if(c.constructor === Object)
        // $FlowFixMe
        this.val = Object.assign({}, ...Object.keys(this.val).map(k => ({ [k]: this.val[k] })));
      if(c instanceof Element)
        // $FlowFixMe
        this.val = c.val;
      else
        // $FlowFixMe
        this.val = c;
      this.hierarchy = h;
    }

    map<U: Product>(f: Leaf<T> => Elementish<T>): Element<U>{
      if(this.val instanceof Array)
        // $FlowFixMe
        return new Element<U>(this.val.map(v => v.map<U>(f)));
      if(this.val && this.val.constructor === Object)
        return new Element<U>(Object.assign({}, ...Object.keys(this.val).map(k => ({
          // $FlowFixMe
          [k]: this.val[k] instanceof Element ? this.val[k].map<U>(f) : this.val[k],
        }))));
      // $FlowFixMe
      return new Element(f(this.val));
    }

    toArray(): Array<Element<T>> | T{
      if(this.val instanceof Array)
        return this.val;
      if(this.val.constructor === Object)
        // $FlowFixMe
        return Object.values(this.val);
      // $FlowFixMe
      return this.val;
    }

    toArrayFlat(): Array<T> | T{
      let arr = this.toArray();
      // $FlowFixMe
      return (arr instanceof Array ? arr.flatMap(e => e.toArrayFlat()) : arr);
    }

    toArrayDeep(): DeepArray<T> | T{
      let arr = this.toArray();
      // $FlowFixMe
      return (arr instanceof Array ? arr.map(e => e.toArrayDeep()) : arr);
    }

    // $FlowFixMe
    [Hierarchy.apply](h){
      return new _Element(this.val, h);
    }

    // $FlowFixMe
    get [Hierarchy.symbol](){
      return this.hierarchy;
    }

  }
}.Element;

const Element = (() => {
  declare class Element<T: Product> extends _Element<T> {

    (): Element<T>,
    <U>(Operation<T, U>): Element<U>,
    <I, U>(Component<I, U>): Component<I, $Call<Element<T>, U>>,

  }
  return ((_Element: any): typeof Element);
})();

export default Element;
export type { Elementish };
