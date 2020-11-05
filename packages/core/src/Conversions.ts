
import { CompoundProduct } from "./CompoundProduct";
import { Product, ProductType } from "./Product";

export interface Conversion<A extends Product, B extends Product> {
  (value: A): B,
}

export interface ConversionImpl<A extends Product, B extends Product> {
  convert: (value: A) => Promise<B>,
  fromType: ProductType<A>,
  toType: ProductType<B>,
}

type Values<T> = T[keyof T];

declare global {
  namespace escad {
    interface ConversionsObj { }
  }
}

export type ConversionsUnion<C = escad.ConversionsObj> = Values<{
  [K in keyof C]: C[K] extends Conversion<any, any> ? C[K] : ConversionsUnion<C[K]>
}>

export type ConversionImpls<C = ConversionsUnion> = (
  C extends Conversion<infer A, infer B>
    ? A extends Product
      ? B extends Product
        ? ConversionImpl<A, B>
        : never
      : never
    : never
);

export type DirectConvertibleTo<T, C = ConversionsUnion> =
  C extends Conversion<infer F, T & Product> ? F : never
export type DirectConvertibleFrom<F, C = ConversionsUnion> =
  C extends Conversion<F & Product, infer T> ? T : never

interface CompoundConvertibleTo<T extends readonly Product[]> {
  isCompoundProduct: true,
  children: { [K in keyof T]: K extends number ? ConvertibleTo<T[K]> : T[K] },
}

interface CompoundConvertibleFrom<T extends readonly Product[]> {
  isCompoundProduct: true,
  children: { [K in keyof T]: K extends number ? ConvertibleFrom<T[K]> : T[K] },
}

export declare const __convertibleTo: unique symbol;
export declare const __convertibleToOverride: unique symbol;
export type __convertibleTo = typeof __convertibleTo;
export type __convertibleToOverride = typeof __convertibleToOverride;

export declare const __convertibleFrom: unique symbol;
export declare const __convertibleFromOverride: unique symbol;
export type __convertibleFrom = typeof __convertibleFrom;
export type __convertibleFromOverride = typeof __convertibleFromOverride;

type _SafeCompoundConvertibleTo<A> = A extends CompoundProduct<infer T> ? CompoundConvertibleTo<T> : A;
export type _ConvertibleTo<T, E=never> =
  | T
  | _SafeCompoundConvertibleTo<T>
  | (
    T extends E
      ? never
      : _ConvertibleTo<DirectConvertibleTo<_SafeCompoundConvertibleTo<T>>, E | T>
  )

type _SafeCompoundConvertibleFrom<A> = A extends CompoundProduct<infer T> ? CompoundConvertibleFrom<T> : A;
export type _ConvertibleFrom<T, E=never> =
  | T
  | _SafeCompoundConvertibleFrom<T>
  | (
    T extends E
      ? never
      : _ConvertibleTo<DirectConvertibleTo<_SafeCompoundConvertibleFrom<T>>, E | T>
  )

export type ConvertibleTo<T extends Product> = Product & {
  [__convertibleToOverride]?: true,
  [__convertibleTo]?: T[__convertibleTo],
}

export type ConvertibleFrom<T extends Product> = Product & {
  [__convertibleFromOverride]?: true,
  [__convertibleFrom]?: T[__convertibleFrom],
}

// declare global {
//   namespace escad {
//     interface ConversionsObj {
//       aToB: Conversion<ProductA, ProductB>,
//     }
//   }
// }

// type Assert<T, U extends T> = U;
// interface ProductA extends LeafProduct {
//   a: 5,
// }
// interface ProductB extends LeafProduct {
//   b: 5,
// }

// type X__<A extends Product> = Assert<ConvertibleTo<A>, ConvertibleTo<ConvertibleTo<A>>>;
// type X_<B extends Product, A extends ConvertibleTo<B>> = Assert<ConvertibleTo<B>, ConvertibleTo<A>>
// type X = Assert<__Element__<ProductB>, __Element__<ProductA>>
// type Y = Assert<Elementish<ProductB>, Elementish<ProductA>>
// type Y_<B extends Product, A extends ConvertibleTo<B>> = Assert<Elementish<B>, Elementish<A>>

// type T = ConvertibleTo<ProductA>;
// type U = ConvertibleTo<ProductB>;
// type V = ConversionsUnion
// type W = DirectConvertibleTo<ProductB>;
