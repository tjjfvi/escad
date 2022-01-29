import { Hierarchy, HierarchyProp } from "./Hierarchy.ts";
import { Product } from "./Product.ts";
import { ConvertibleTo } from "./Conversions.ts";
import { checkTypeProperty } from "./checkTypeProperty.ts";
import { artifactManager } from "./ArtifactManager.ts";
import { Promisish } from "./Promisish.ts";

interface ObjMap<T> {
  readonly [name: string]: T;
}
const ObjMap = {
  isObjMap: (o: unknown): o is ObjMap<unknown> =>
    !Product.isProduct(o) &&
    typeof o === "object" && !!o &&
    (o.constructor === Object || Object.getPrototypeOf(o) === null),
};

type Arrayish<T> = ObjMap<T> | ReadonlyArray<T>;
export type Elementish<T extends Product> =
  | DeepArray<Elementish<T>>
  | ReadonlyArray<Elementish<T>>
  | ObjMap<Elementish<T>>
  | Element<T>
  | T;

export type ConvertibleElement<T extends Product> = Element<ConvertibleTo<T>>;
export type ConvertibleElementish<T extends Product> = Elementish<
  ConvertibleTo<T>
>;

interface DeepArray<T> extends ReadonlyArray<DeepArray<T> | T> {}

export interface Element<T extends Product> {
  readonly type: "Element";
  readonly value: Promisish<T | Arrayish<Element<T>>>;
  readonly hierarchy?: HierarchyProp;
}

export const Element = {
  create: <T extends Product>(
    elementish: Promisish<Elementish<T>>,
    hierarchy?: HierarchyProp,
  ): Element<T> => {
    const elementPromise = Element.createPromise(elementish, hierarchy);
    return {
      type: "Element",
      value: elementPromise.then((el) => el.value),
      hierarchy: elementPromise.then((el) => el.hierarchy),
    };
  },

  createPromise: async <T extends Product>(
    elementish: Promisish<Elementish<T>>,
    hierarchy?: HierarchyProp,
  ): Promise<Element<T>> => {
    let value: T | Arrayish<Element<T>>;

    elementish = await elementish;
    hierarchy = await hierarchy;

    if (Element.isElement(elementish)) {
      if (!hierarchy) return elementish;
      elementish = await elementish.value;
    }

    if (elementish instanceof Array) {
      value = elementish.map((x) => Element.create(x));
      if (value.some((x) => x.hierarchy)) {
        hierarchy ??= Hierarchy.from(elementish);
      }
    } else if (ObjMap.isObjMap(elementish)) {
      value = Object.fromEntries(
        Object.entries(elementish).map(([k, v]) => [k, Element.create(v)]),
      );
      if (Object.values(value).some((x) => x.hierarchy)) {
        hierarchy ??= Hierarchy.from(elementish);
      }
    } else if (Product.isProduct(elementish)) {
      value = elementish;
      artifactManager.storeRaw(value);
    } else {
      throw new Error("Invalid elementish passed to Element");
    }

    return {
      type: "Element",
      value,
      hierarchy,
    };
  },

  toArray: async <T extends Product>(
    element: Elementish<T>,
  ): Promise<Array<Element<T>>> => {
    element = Element.create(element);
    const value = await element.value;
    if (Array.isArray(value)) {
      return value;
    }
    if (ObjMap.isObjMap(value)) {
      return Object.values(value);
    }
    if (Product.isProduct(value)) {
      return [element];
    }
    throw new Error("Invalid Element.val type");
  },

  toArrayDeep: async <T extends Product>(
    element: Elementish<T>,
  ): Promise<DeepArray<T> | T> => {
    element = Element.create(element);
    const value = await element.value;
    if (Product.isProduct(value)) {
      return value;
    }
    return await Promise.all(
      (await Element.toArray(element)).map(Element.toArrayDeep),
    );
  },

  toArrayFlat: async <T extends Product>(
    element: Elementish<T>,
  ): Promise<T[]> => {
    element = Element.create(element);
    const value = await element.value;
    if (Product.isProduct(value)) {
      return [value];
    }
    return (await Promise.all(
      (await Element.toArray(element)).map(Element.toArrayFlat),
    )).flat();
  },

  concat: <T extends Product, U extends Product>(
    a: Element<T>,
    b: Element<U>,
  ): Element<T | U> => Element.create(Element.concatPromise(a, b)),

  concatPromise: async <T extends Product, U extends Product>(
    a: Element<T>,
    b: Element<U>,
  ): Promise<Element<T | U>> =>
    Element.create(
      ([] as Elementish<T | U>[]).concat(await a.value).concat(await b.value),
    ),

  applyHierarchy: <T extends Product>(
    element: Element<T>,
    hierarchy?: HierarchyProp,
  ): Element<T> => Element.create(element.value, hierarchy),

  isElement: checkTypeProperty.string<Element<Product>>("Element"),

  map: <T extends Product, U extends Product>(
    element: Element<T>,
    fn: (value: T) => Promisish<Elementish<U>>,
  ): Element<U> => Element.create(Element.mapPromise(element, fn)),

  mapPromise: async <T extends Product, U extends Product>(
    element: Element<T>,
    fn: (value: T) => Promisish<Elementish<U>>,
  ): Promise<Element<U>> => {
    const value = await element.value;

    if (value instanceof Array) {
      return Element.create(value.map((v) => Element.map(v, fn)));
    }

    if (ObjMap.isObjMap(value)) {
      return Element.create(
        Object.fromEntries(
          Object.entries(value).map(([k, v]) => [k, Element.map(v, fn)]),
        ),
      );
    }

    if (Product.isProduct(value)) {
      return Element.create(fn(value));
    }

    throw new Error("Invalid Element.val type");
  },
};
