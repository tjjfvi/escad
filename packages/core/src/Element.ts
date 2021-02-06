
import { Hierarchy } from "./Hierarchy";
import { Operation, __Operation__ } from "./Operation";
import { Component, __Component__ } from "./Component";
import { Product } from "./Product";
import { __Thing__ } from "./__Thing__";
import { builtins, Builtins } from "./builtins";
import { ConvertibleTo } from "./Conversions";

interface ObjMap<T> {
  readonly [x: string]: T,
}
const isObjMap = (o: unknown): o is ObjMap<unknown> =>
  !Product.isProduct(o) &&
  typeof o === "object" && !!o &&
  (o.constructor === Object || Object.getPrototypeOf(o) === null)

type ElementishFlat<T> = Array<T> | ObjMap<T>;
export type Elementish<T extends Product> =
  | ReadonlyArray<Elementish<T>>
  | ObjMap<Elementish<T>>
  | ConvertibleTo<T>
  | __Element__<T>
export type DeepArray<T> = Array<T | DeepArray<T>>;

export class __Element__<T extends Product> extends __Thing__ {

  // declare protected __t__: T extends infer U ? U extends Product ? ConvertibleTo<T> : never : never;
  declare protected __t__: T extends infer U ? U extends Product ? ConvertibleTo<T> : never : never;

}

export type ElementOut<T extends Product, Arg> =
  Arg extends __Element__<infer U> ? Element<T | U> :
  Arg extends __Operation__<infer I, infer O> ? T extends Elementish<I> ? Element<O> : never :
  Arg extends __Component__<infer I, infer O> ? Component<I, ElementOut<T, O>> :
  never

export interface Element<T extends Product> {
  _: this,
  (): Element<T>,
  <A>(arg: A): ElementOut<T, A>,
}

type _ElementBuiltins<T extends Product> = {
  [K in keyof Builtins]: ElementOut<T, Builtins[K]>
}

type _ExcludeNevers<T> = {
  [K in keyof T as T[K] extends "__never__" ? never : K]: T[K]
};

export interface Element<T extends Product> extends _ExcludeNevers<_ElementBuiltins<T>> { }

export class Element<T extends Product> extends __Element__<T> {

  val: ElementishFlat<Element<T>> | ConvertibleTo<T>;

  static create<T extends Product>(c: Array<Elementish<T>>, h?: Hierarchy): ArrayElement<T>;
  static create<T extends Product>(c: ObjMap<Elementish<T>>, h?: Hierarchy): ObjMapElement<T>;
  static create<T extends Product>(c: ElementishFlat<Elementish<T>>, h?: Hierarchy): ArrayishElement<T>;
  static create<T extends Product>(c: ConvertibleTo<T>, h?: Hierarchy): LeafElement<T>;
  static create<T extends Product>(c: ArrayElement<T>, h?: Hierarchy): ArrayElement<T>;
  static create<T extends Product>(c: ObjMapElement<T>, h?: Hierarchy): ObjMapElement<T>;
  static create<T extends Product>(c: ArrayishElement<T>, h?: Hierarchy): ArrayishElement<T>;
  static create<T extends Product>(c: LeafElement<T>, h?: Hierarchy): LeafElement<T>;
  static create<T extends Product>(c: Elementish<T>, h?: Hierarchy): Element<T>;
  static create<T extends Product>(c: Elementish<T>, h?: Hierarchy){
    return new Element(c, h);
  }

  constructor(elementish: Elementish<T>, public hierarchy: Hierarchy = Hierarchy.from(elementish)){
    super(arg => {
      if(!arg)
        return this;
      if(arg instanceof Operation)
        return arg(this);
      if(arg instanceof Component)
        return new Component<any, any>(arg.name + "'", (...args) => this(arg(...args)), false)
      if(arg instanceof Element)
        return this.join(arg);
      throw new Error("Invalid argument to Element");
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
    })
    if(elementish instanceof Array)
      this.val = elementish.map(x => new Element(x));
    else if(isObjMap(elementish))
      this.val = Object.assign(
        Object.create(null),
        ...Object.entries(elementish).map(([k, v]) => ({ [k]: new Element(v) }))
      );
    else if(elementish instanceof Element)
      this.val = elementish.val;
    else
      this.val = elementish as ConvertibleTo<T>;
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
    return Product.isProduct(this.val)
  }

  map<U extends Product>(
    f: (x: ConvertibleTo<T>) => Elementish<U>,
    hierarchyGen: (
      e: Elementish<U>,
      old: Element<T>,
      isLeaf: boolean,
      isRoot: boolean,
    ) => Hierarchy = x => Hierarchy.from(x),
    isRoot = true,
  ): Element<U>{
    let createElement = (e: Elementish<U>) => new Element(e, hierarchyGen(e, this, this.isLeaf(), isRoot));

    if(this.isArray())
      return createElement((this as ArrayElement<T>).val.map(v => v.map<U>(f, hierarchyGen, false)));

    if(this.isObjMap())
      return createElement(Object.assign({}, ...Object.entries(this.val).map(([k, v]) => ({
        [k]: v instanceof Element ? v.map<U>(f, hierarchyGen, false) : v,
      }))));

    if(this.isLeaf())
      return createElement(f(this.val));

    throw new Error("Invalid Element.val type");
  }

  toArray(): Array<Element<T>> | ConvertibleTo<T>{
    if(this.isArray())
      return this.val;
    if(this.isObjMap())
      return Object.values(this.val);
    if(this.isLeaf())
      return this.val;
    throw new Error("Invalid Element.val type");
  }

  toArrayDeep(): DeepArray<ConvertibleTo<T>> | ConvertibleTo<T>{
    if(this.isLeaf())
      return this.val;
    if(this.isArrayish())
      return this.toArray().map(e => e.toArrayDeep());
    throw new Error("Invalid Element.val type")
  }

  toArrayFlat(): ReadonlyArray<ConvertibleTo<T>>{
    if(this.isLeaf())
      return [this.val];
    if(this.isArrayish())
      return this.toArray().flatMap(e => e.toArrayFlat());
    throw new Error("Invalid Element.val type")
  }

  join<U extends Product>(el: __Element__<U>): Element<T | U>{
    let toArr = <T extends Product>(el: Element<T>) =>
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
    return new Element<T>(this, hierarchy);
  }

}

export interface ArrayElement<T extends Product> extends ArrayishElement<T> {
  val: Array<Element<T>>,
  applyHierarchy(hierarchyGen: (oldHierarchy: Hierarchy) => Hierarchy): ArrayElement<T>,
  applyHierarchy(hierarchy: Hierarchy): ArrayElement<T>,
}

export interface ObjMapElement<T extends Product> extends ArrayishElement<T> {
  val: ObjMap<Element<T>>,
  applyHierarchy(hierarchyGen: (oldHierarchy: Hierarchy) => Hierarchy): ObjMapElement<T>,
  applyHierarchy(hierarchy: Hierarchy): ObjMapElement<T>,
}

export interface ArrayishElement<T extends Product> extends Element<T> {
  val: ElementishFlat<Element<T>>,
  toArray(_?: true): Element<T>[],
  toArrayDeep(_?: true): DeepArray<ConvertibleTo<T>>,
  applyHierarchy(hierarchyGen: (oldHierarchy: Hierarchy) => Hierarchy): ArrayishElement<T>,
  applyHierarchy(hierarchy: Hierarchy): ArrayishElement<T>,
}

export interface LeafElement<T extends Product> extends Element<T> {
  val: ConvertibleTo<T>,
  toArray(_?: true): ConvertibleTo<T>,
  toArrayDeep(_?: true): ConvertibleTo<T>,
  applyHierarchy(hierarchyGen: (oldHierarchy: Hierarchy) => Hierarchy): LeafElement<T>,
  applyHierarchy(hierarchy: Hierarchy): LeafElement<T>,
}
