
import { Hierarchy } from "./Hierarchy";
import { Operation, OperationConstraint } from "./Operation";
import { Component, ComponentConstraint } from "./Component";
import { Product } from "./Product";
import { chainables, Chainables } from "./chainables";
import { ConvertibleTo } from "./Conversions";
import { checkTypeProperty } from "./checkTypeProperty";
import { ExtensibleFunction } from "./ExtensibleFunction";

interface ObjMap<T> {
  readonly [name: string]: T,
}
const isObjMap = (o: unknown): o is ObjMap<unknown> =>
  !Product.isProduct(o) &&
  typeof o === "object" && !!o &&
  (o.constructor === Object || Object.getPrototypeOf(o) === null)

export type DeepArray<T> = Array<T | DeepArray<T>>;
export type Arrayish<T> = ReadonlyArray<T> | ObjMap<T>;
export type Elementish<T extends Product> =
  | ReadonlyArray<Elementish<T>>
  | ObjMap<Elementish<T>>
  | ElementConstraint<T>
  | T

export type ConvertibleElementConstraint<T extends Product> = ElementConstraint<ConvertibleTo<T>>
export type ConvertibleElementish<T extends Product> = Elementish<ConvertibleTo<T>>
export type ConvertibleElement<T extends Product> = Element<ConvertibleTo<T>>

export interface ElementConstraint<T extends Product> {
  readonly type: "Element",
  readonly value: Elementish<T>,
  readonly hierarchy?: Hierarchy,
}

export const ElementConstraint = {
  isElementConstraint: checkTypeProperty<ElementConstraint<Product>>("Element"),
}

export type ElementOut<T extends Product, Arg> =
  [T] extends [infer T_] ? [T_] extends [infer T] ? [T] extends [Product] ?
    Arg extends ElementConstraint<infer U> ? Element<T | U> :
    Arg extends OperationConstraint<infer I, infer O> ? T extends Elementish<I> ? Element<O> : never :
    Arg extends ComponentConstraint<infer I, infer O> ? Component<I, ElementOut<T, O>> :
    never
  : never : never : never

export interface Element<T extends Product> {
  _: this,
  (): Element<T>,
  <A>(arg: A): ElementOut<T, A>,
}

type _ElementChainables<T extends Product> = {
  [K in keyof Chainables]: ElementOut<T, Chainables[K]>
}

export interface Element<T extends Product> extends _ElementChainables<T> { }

export class Element<T extends Product> extends ExtensibleFunction implements ElementConstraint<T> {

  readonly type = "Element";
  readonly value: Arrayish<Element<T>> | T;

  static create<T extends Product>(c: Array<Elementish<T>>, h?: Hierarchy): ArrayElement<T>;
  static create<T extends Product>(c: ObjMap<Elementish<T>>, h?: Hierarchy): ObjMapElement<T>;
  static create<T extends Product>(c: Arrayish<Elementish<T>>, h?: Hierarchy): ArrayishElement<T>;
  static create<T extends Product>(c: T, h?: Hierarchy): LeafElement<T>;
  static create<T extends Product>(c: ArrayElement<T>, h?: Hierarchy): ArrayElement<T>;
  static create<T extends Product>(c: ObjMapElement<T>, h?: Hierarchy): ObjMapElement<T>;
  static create<T extends Product>(c: ArrayishElement<T>, h?: Hierarchy): ArrayishElement<T>;
  static create<T extends Product>(c: LeafElement<T>, h?: Hierarchy): LeafElement<T>;
  static create<T extends Product>(c: Elementish<T>, h?: Hierarchy): Element<T>;
  static create<T extends Product>(c: Elementish<T>, h?: Hierarchy){
    return new Element(c, h);
  }

  constructor(elementish: Elementish<T>, public readonly hierarchy: Hierarchy = Hierarchy.from(elementish)){
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

        if(!(prop in chainables) || typeof prop === "symbol")
          return;

        const val = chainables[prop as keyof typeof chainables];
        return this(val);
      }
    })
    while(ElementConstraint.isElementConstraint(elementish))
      elementish = elementish.value;
    if(elementish instanceof Array)
      this.value = elementish.map(x => new Element(x));
    else if(isObjMap(elementish))
      this.value = Object.assign(
        Object.create(null),
        ...Object.entries(elementish).map(([k, v]) => ({ [k]: new Element(v) }))
      );
    else if(Product.isProduct(elementish))
      this.value = elementish;
    else
      throw new Error("Invalid elementish passed to Element");
  }

  static isArray<T extends Product>(el: Element<T>): el is ArrayElement<T>{
    return el.value instanceof Array;
  }

  static isObjMap<T extends Product>(el: Element<T>): el is ObjMapElement<T>{
    return isObjMap(el.value);
  }

  static isArrayish<T extends Product>(el: Element<T>): el is ArrayishElement<T>{
    return Element.isArray(el) || Element.isObjMap(el);
  }

  static isLeaf<T extends Product>(el: Element<T>): el is LeafElement<T>{
    return Product.isProduct(el.value)
  }

  map<U extends Product>(
    f: (value: T) => Elementish<U>,
    hierarchyGen: (
      e: Elementish<U>,
      old: Element<T>,
      isLeaf: boolean,
      isRoot: boolean,
    ) => Hierarchy = x => Hierarchy.from(x),
    isRoot = true,
  ): Element<U>{
    let createElement = (e: Elementish<U>) => new Element(e, hierarchyGen(e, this, Element.isLeaf(this), isRoot));

    if(Element.isArray(this))
      return createElement((this as ArrayElement<T>).value.map(v => v.map<U>(f, hierarchyGen, false)));

    if(Element.isObjMap(this))
      return createElement(Object.assign({}, ...Object.entries(this.value).map(([k, v]) => ({
        [k]: v instanceof Element ? v.map<U>(f, hierarchyGen, false) : v,
      }))));

    if(Element.isLeaf(this))
      return createElement(f(this.value));

    throw new Error("Invalid Element.val type");
  }

  toArray(): Array<Element<T>> | T{
    if(Element.isArray(this))
      return this.value;
    if(Element.isObjMap(this))
      return Object.values(this.value);
    if(Element.isLeaf(this))
      return this.value;
    throw new Error("Invalid Element.val type");
  }

  toArrayDeep(): DeepArray<T> | T{
    if(Element.isLeaf(this))
      return this.value;
    if(Element.isArrayish(this))
      return this.toArray().map(e => e.toArrayDeep());
    throw new Error("Invalid Element.val type")
  }

  toArrayFlat(): ReadonlyArray<T>{
    if(Element.isLeaf(this))
      return [this.value];
    if(Element.isArrayish(this))
      return this.toArray().flatMap(e => e.toArrayFlat());
    throw new Error("Invalid Element.val type")
  }

  join<U extends Product>(el: ElementConstraint<U>): Element<T | U>{
    let toArr = <T extends Product>(el: Element<T>) =>
      Element.isArray(el) ? el.value : [el];
    return new Element<T | U>([...toArr(this), ...toArr(el as Element<U>)])
  }

  applyHierarchy(hierarchy: Hierarchy): Element<T>{
    return new Element<T>(this, hierarchy);
  }

  static isElement(value: unknown): value is Element<Product>{
    return ElementConstraint.isElementConstraint(value) && value instanceof Element;
  }

  static fromElementConstraint<T extends Product>(element: ElementConstraint<T>){
    return new Element(element);
  }

}

export interface ArrayElement<T extends Product> extends ArrayishElement<T> {
  value: Array<Element<T>>,
  applyHierarchy(hierarchy: Hierarchy): ArrayElement<T>,
}

export interface ObjMapElement<T extends Product> extends ArrayishElement<T> {
  value: ObjMap<Element<T>>,
  applyHierarchy(hierarchy: Hierarchy): ObjMapElement<T>,
}

export interface ArrayishElement<T extends Product> extends Element<T> {
  value: Arrayish<Element<T>>,
  toArray(_?: true): Element<T>[],
  toArrayDeep(_?: true): DeepArray<T>,
  applyHierarchy(hierarchy: Hierarchy): ArrayishElement<T>,
}

export interface LeafElement<T extends Product> extends Element<T> {
  value: T,
  toArray(_?: true): T,
  toArrayDeep(_?: true): T,
  applyHierarchy(hierarchy: Hierarchy): LeafElement<T>,
}
