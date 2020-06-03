
import { Leaf } from "./Work";
import { Hierarchy } from "./Hierarchy";
import { Operation, __Operation__ } from "./Operation";
import { Component, __Component__ } from "./Component";
import { Product } from "./Product";
import { __Thing__ } from "./__Thing__";
import { builtins, Builtins } from "./builtins";

interface ObjMap<T> {
  [x: string]: T,
}
const isObjMap = (o: unknown): o is ObjMap<unknown> =>
  typeof o === "object" && !!o && (o.constructor === Object || Object.getPrototypeOf(o) === null);

type ElementishFlat<T> = Array<T> | ObjMap<T>;
export type Elementish<T extends Product<T>> = Array<Elementish<T>> | ObjMap<Elementish<T>> | Leaf<T> | __Element__<T>;
export type DeepArray<T> = Array<T | DeepArray<T>>;

export class __Element__<T extends Product<T>> extends __Thing__ {

  declare protected __t__: T;

}

type ElementIn<T extends Product<T>> = __Element__<any> | __Operation__<T, any> | __Component__<any, ElementIn<T>>
type ElementOut<T extends Product<T>, Arg extends ElementIn<T>> =
  Arg extends __Element__<infer U> ? Element<T | U> :
  Arg extends __Operation__<T, infer U> ? Element<U> :
  Arg extends __Component__<infer I, infer U> ? U extends ElementIn<T> ? Component<I, ElementOut<T, U>> : never :
  never

export interface Element<T extends Product<T>> {
  (): Element<T>,
  <U extends Product<U>>(el: __Element__<U>): Element<T | U>,
  <U extends Product<U>>(o: __Operation__<T, U>): Element<U>,
  <I extends any[], U extends ElementIn<T>>(c: __Component__<I, U>): Component<I, ElementOut<T, U>>,
}

type _ElementOut<T extends Product<T>, Arg> = Arg extends ElementIn<T> ? ElementOut<T, Arg> : never;

type _ElementBuiltins<T extends Product<T>> = {
  [K in keyof Builtins]: _ElementOut<T, Builtins[K]>
}

export interface Element<T extends Product<T>> extends _ElementBuiltins<T> { }

export class Element<T extends Product<T>> extends __Element__<T> {

  val: ElementishFlat<Element<T>> | Leaf<T>;
  hierarchy: Hierarchy;

  static create<T extends Product<T>>(c: Array<Elementish<T>>, h?: Hierarchy): ArrayElement<T>;
  static create<T extends Product<T>>(c: ObjMap<Elementish<T>>, h?: Hierarchy): ObjMapElement<T>;
  static create<T extends Product<T>>(c: ElementishFlat<Elementish<T>>, h?: Hierarchy): ArrayishElement<T>;
  static create<T extends Product<T>>(c: Leaf<T>, h?: Hierarchy): LeafElement<T>;
  static create<T extends Product<T>>(c: ArrayElement<T>, h?: Hierarchy): ArrayElement<T>;
  static create<T extends Product<T>>(c: ObjMapElement<T>, h?: Hierarchy): ObjMapElement<T>;
  static create<T extends Product<T>>(c: ArrayishElement<T>, h?: Hierarchy): ArrayishElement<T>;
  static create<T extends Product<T>>(c: LeafElement<T>, h?: Hierarchy): LeafElement<T>;
  static create<T extends Product<T>>(c: Elementish<T>, h?: Hierarchy): Element<T>;
  static create<T extends Product<T>>(c: Elementish<T>, h?: Hierarchy){
    return new Element(c, h);
  }

  constructor(c: Elementish<T>, h: Hierarchy = Hierarchy.fromElementish(c)){
    super(arg => {
      if(!arg)
        return that;
      if(arg instanceof Operation)
        return arg(this);
      if(arg instanceof Component)
        return new Component<any, any>(arg.name + "'", (...args) => that(arg(...args)))
      if(arg instanceof Element)
        return this.join(arg);
      throw new Error("Invalid argument to Element");
    }, {
      get: (target, prop) => {
        if(prop in target)
          return target[prop as keyof typeof target];

        if(!(prop in builtins) || typeof prop === "symbol")
          return;

        const val = builtins[prop as keyof typeof builtins];
        // @ts-ignore
        return this(val);
      }
    })
    let that = this;
    if(c instanceof Array)
      this.val = c.map(x => new Element(x));
    else if(isObjMap(c))
      this.val = Object.assign(Object.create(null), ...Object.entries(c).map(([k, v]) => ({ [k]: new Element(v) })));
    else if(c instanceof Element)
      this.val = c.val;
    else
      this.val = c as Leaf<T>;
    this.hierarchy = h;
  }

  isArray(): this is ArrayElement<T>{
    return this.val instanceof Array;
  }

  isObjMap(): this is ObjMapElement<T>{
    return isObjMap(this.val);
  }

  isArrayish(): this is ArrayishElement<T>{
    return this.isArray() || this.isObjMap();
  }

  isLeaf(): this is LeafElement<T>{
    return !this.isArrayish();
  }

  map<U extends Product<U>>(
    f: (x: Leaf<T>) => Elementish<U>,
    hierarchyGen: (
      e: Elementish<U>,
      old: Element<T>,
      isLeaf: boolean,
      isRoot: boolean,
    ) => Hierarchy = Hierarchy.fromElementish,
    isRoot = true,
  ): Element<U>{
    let createElement = (e: Elementish<U>) => new Element(e, hierarchyGen(e, this, this.isLeaf(), isRoot));

    if(this.isArray())
      return createElement(this.val.map(v => v.map<U>(f, hierarchyGen, false)));

    if(this.isObjMap())
      return createElement(Object.assign({}, ...Object.entries(this.val).map(([k, v]) => ({
        [k]: v instanceof Element ? v.map<U>(f, hierarchyGen, false) : v,
      }))));

    if(this.isLeaf())
      return createElement(f(this.val));

    throw new Error("Invalid Element.val type");
  }

  toArray(): Array<Element<T>> | Leaf<T>{
    if(this.isArray())
      return this.val;
    if(this.isObjMap())
      return Object.values(this.val);
    if(this.isLeaf())
      return this.val;
    throw new Error("Invalid Element.val type");
  }

  toArrayDeep(): DeepArray<Leaf<T>> | Leaf<T>{
    if(this.isLeaf())
      return this.val;
    if(this.isArrayish())
      return this.toArray().map(e => e.toArrayDeep());
    throw new Error("Invalid Element.val type")
  }

  toArrayFlat(): Array<Leaf<T>>{
    if(this.isLeaf())
      return [this.val];
    if(this.isArrayish())
      return this.toArray().flatMap(e => e.toArrayFlat());
    throw new Error("Invalid Element.val type")
  }

  join<U extends Product<U>>(el: __Element__<U>): Element<T | U>{
    let toArr = <T extends Product<T>>(el: Element<T>) =>
      el.isArray() ? el.val : [el];
    return new Element<T | U>([...toArr(this), ...toArr(el as Element<U>)])
  }

  applyHierarchy(hierarchyGen: (oldHierarchy: Hierarchy) => Hierarchy): Element<T>
  applyHierarchy(hierarchy: Hierarchy): Element<T>
  applyHierarchy(arg: Hierarchy | ((h: Hierarchy) => Hierarchy)): Element<T>{
    let hierarchy =
      typeof arg === "function" ?
        arg(this.hierarchy) :
        arg
    return new Element(this, hierarchy);
  }

}

export interface ArrayElement<T extends Product<T>> extends ArrayishElement<T> {
  val: Array<Element<T>>,
  applyHierarchy(hierarchyGen: (oldHierarchy: Hierarchy) => Hierarchy): ArrayElement<T>,
  applyHierarchy(hierarchy: Hierarchy): ArrayElement<T>,
}

export interface ObjMapElement<T extends Product<T>> extends ArrayishElement<T> {
  val: ObjMap<Element<T>>,
  applyHierarchy(hierarchyGen: (oldHierarchy: Hierarchy) => Hierarchy): ObjMapElement<T>,
  applyHierarchy(hierarchy: Hierarchy): ObjMapElement<T>,
}

export interface ArrayishElement<T extends Product<T>> extends Element<T> {
  val: ElementishFlat<Element<T>>,
  toArray(_?: true): Element<T>[],
  toArrayDeep(_?: true): DeepArray<Leaf<T>>,
  applyHierarchy(hierarchyGen: (oldHierarchy: Hierarchy) => Hierarchy): ArrayishElement<T>,
  applyHierarchy(hierarchy: Hierarchy): ArrayishElement<T>,
}

export interface LeafElement<T extends Product<T>> extends Element<T> {
  val: Leaf<T>,
  toArray(_?: true): Leaf<T>,
  toArrayDeep(_?: true): Leaf<T>,
  applyHierarchy(hierarchyGen: (oldHierarchy: Hierarchy) => Hierarchy): LeafElement<T>,
  applyHierarchy(hierarchy: Hierarchy): LeafElement<T>,
}
