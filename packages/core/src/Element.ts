
import { Hierarchy } from "./Hierarchy";
import { Product } from "./Product";
import { ConvertibleTo } from "./Conversions";
import { checkTypeProperty } from "./checkTypeProperty";

interface ObjMap<T> {
  readonly [name: string]: T,
}
const ObjMap = {
  isObjMap: (o: unknown): o is ObjMap<unknown> =>
    !Product.isProduct(o) &&
  typeof o === "object" && !!o &&
  (o.constructor === Object || Object.getPrototypeOf(o) === null)
}

type Arrayish<T> = ObjMap<T> | ReadonlyArray<T>
export type Elementish<T extends Product> =
  | DeepArray<Elementish<T>>
  | ReadonlyArray<Elementish<T>>
  | ObjMap<Elementish<T>>
  | Element<T>
  | T

export type ConvertibleElement<T extends Product> = Element<ConvertibleTo<T>>
export type ConvertibleElementish<T extends Product> = Elementish<ConvertibleTo<T>>

interface DeepArray<T> extends ReadonlyArray<DeepArray<T> | T> {}

export interface Element<T extends Product> {
  readonly type: "Element",
  readonly value: T | Arrayish<Element<T>>,
  readonly hierarchy?: Hierarchy,
}

export const Element = {
  create: <T extends Product>(elementish: Elementish<T>, hierarchy = Hierarchy.from(elementish)): Element<T> => {
    let value: T | Arrayish<Element<T>>;
    while(Element.isElement(elementish))
      elementish = elementish.value;
    if(elementish instanceof Array)
      value = elementish.map(x => Element.create(x));
    else if(ObjMap.isObjMap(elementish))
      value = Object.assign(
        Object.create(null),
        ...Object.entries(elementish).map(([k, v]) => ({ [k]: Element.create(v) }))
      );
    else if(Product.isProduct(elementish))
      value = elementish;
    else
      throw new Error("Invalid elementish passed to Element");
    return {
      type: "Element",
      value,
      hierarchy,
    }
  },
  toArray: <T extends Product>(element: Elementish<T>): Array<Element<T>> => {
    element = Element.create(element);
    if(Array.isArray(element.value))
      return element.value;
    if(ObjMap.isObjMap(element.value))
      return Object.values(element.value);
    if(Product.isProduct(element.value))
      return [element];
    throw new Error("Invalid Element.val type");
  },
  toArrayDeep: <T extends Product>(element: Elementish<T>): DeepArray<T> | T => {
    element = Element.create(element);
    if(Product.isProduct(element.value))
      return element.value;
    return Element.toArray(element).map(Element.toArrayDeep);
  },
  toArrayFlat: <T extends Product>(element: Elementish<T>): T[] => {
    element = Element.create(element);
    if(Product.isProduct(element.value))
      return [element.value];
    return Element.toArray(element).flatMap(Element.toArrayFlat)
  },
  concat:
    <T extends Product, U extends Product>(a: Element<T>, b: Element<U>): Element<T | U> => {
      let toArr = <T extends Product>(el: Element<T>): T[] =>
      (Array.isArray(el) ? el.value : [el]) as never;
      return Element.create([...toArr(a), ...toArr(b)]);
    },
  applyHierarchy: <T extends Product>(element: Element<T>, hierarchy: Hierarchy): Element<T> =>
    Element.create(element.value, hierarchy),
  isElement: checkTypeProperty<Element<Product>>("Element"),
  map: <T extends Product, U extends Product>(
    element: Element<T>,
    fn: (value: T) => Elementish<U>,
    hierarchyGen: (
      el: Element<U>,
      old: Element<T>,
      isLeaf: boolean,
      isRoot: boolean,
    ) => Hierarchy = x => Hierarchy.from(x),
    isRoot = true,
  ): Element<U> => {
    let createElement = (e: Elementish<U>) =>
      Element.create(e, hierarchyGen(Element.create(e), element, Product.isProduct(element.value), isRoot));

    if(element.value instanceof Array)
      return createElement(element.value.map(v => Element.map(Element.create(v), fn, hierarchyGen, false).value));

    if(ObjMap.isObjMap(element.value))
      return createElement(Object.assign({}, ...Object.entries(element.value).map(([k, v]) => ({
        [k]: Element.isElement(v) ? Element.map(v as never, fn, hierarchyGen, false) : v,
      }))));

    if(Product.isProduct(element.value))
      return createElement(fn(element.value));

    if(Element.isElement(element.value))
      return createElement(Element.map(element.value, fn, hierarchyGen, false));

    throw new Error("Invalid Element.val type");
  }
}
