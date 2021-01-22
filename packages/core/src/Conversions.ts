
import { Product, ProductType } from "./Product";

export interface Conversion<A, B> {
  (value: A): B,
}

export interface ConversionImpl<A extends Product, B extends Product> {
  convert: (value: A) => Promise<B>,
  fromType: ProductType<A>,
  toType: ProductType<B>,
  weight: number,
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
        ? ConversionImpl<Extract<A, Product>, Extract<B, Product>>
        : never
      : never
    : never
);

export type DirectConvertibleTo<T, C = ConversionsUnion> =
  C extends Conversion<infer F, infer T2>
    ? Omit<T2, __convertibleTo> extends T
      ? Omit<F, __convertibleTo>
      : never
    : never

export declare const __convertibleTo: unique symbol;
export declare const __convertibleToOverride: unique symbol;
export type __convertibleTo = typeof __convertibleTo;
export type __convertibleToOverride = typeof __convertibleToOverride;

type _SafeTupleConvertibleTo<A> =
  "children" extends keyof A
    ? {
      readonly isTupleProduct: true,
      readonly children: {
        [K in keyof A["children"]]: K extends number ? _ConvertibleTo<A["children"][K]> : A["children"][K]
      },
    }
    : A
export type _ConvertibleTo<T, E=never> =
  | T
  | _SafeTupleConvertibleTo<T>
  | (
    T extends E
      ? never
      : _ConvertibleTo<DirectConvertibleTo<_SafeTupleConvertibleTo<T>>, E | T>
  )

export type ConvertibleTo<T extends Product> = Product & {
  [__convertibleToOverride]?: true,
  [__convertibleTo]?: T[__convertibleTo],
}

// Tests:

// declare global {
//   namespace escad {
//     interface ConversionsObj {
//       stuff: (
//         | Conversion<ProductA, ProductB>
//         | Conversion<ProductB, ProductA>
//         | Conversion<TupleProduct<[ProductA, ProductA]>, ProductA>
//       ),
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

// type Z = Assert<__Element__<ProductB>, __Element__<TupleProduct<[ProductB, ProductA]>>>

// type X__<A extends Product> = Assert<ConvertibleTo<A>, ConvertibleTo<ConvertibleTo<A>>>;
// type X_<B extends Product, A extends ConvertibleTo<B>> = Assert<ConvertibleTo<B>, ConvertibleTo<A>>
// type X = Assert<__Element__<ProductB>, __Element__<ProductA>>
// type Y = Assert<Elementish<ProductB>, Elementish<ProductA>>
// type Y_<B extends Product, A extends ConvertibleTo<B>> = Assert<Elementish<B>, Elementish<A>>

// type T = ConvertibleTo<ProductA>;
// type U = ConvertibleTo<ProductB>;
// type V = ConversionsUnion
// type W = DirectConvertibleTo<ProductB>;
