
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

type Match<T, U> = keyof U extends keyof T ? Pick<T, keyof U> extends U ? true : false : false;

type _ImplicitlyConvertibleTo<A> = A extends A ?
  Match<A, { type: "TupleProduct" }> extends true
    ? "children" extends keyof A
      ? {
        readonly type: "TupleProduct",
        readonly children: {
          readonly [K in keyof A["children"]]: K extends number ? _ConvertibleTo<A["children"][K]> : A["children"][K]
        },
      }
      : never
    : Match<A, { type: "ArrayProduct" }> extends true
      ? "children" extends keyof A ? number extends keyof A["children"]
        ? {
          readonly type: "ArrayProduct",
          readonly children: readonly _ConvertibleTo<A["children"][number]>[],
        }
        | {
          readonly type: "TupleProduct",
          readonly children: Readonly<Record<number | "0", _ConvertibleTo<A["children"][number]>>>,
        }
        : never : never
      : A
: never;

export type _ConvertibleTo<T, E=never> =
  | T
  | _ImplicitlyConvertibleTo<T>
  | (
    T extends E
      ? never
      : _ConvertibleTo<DirectConvertibleTo<_ImplicitlyConvertibleTo<T>>, E | T>
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
//         | Conversion<ArrayProduct<ProductA>, ProductA>
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
// interface ProductC extends LeafProduct {
//   c: 5,
// }

// type A = Assert<ConvertibleTo<ArrayProduct<ProductA>>, ArrayProduct<ProductB>>
// // @ts-expect-error anti-axiom
// type B = Assert<ConvertibleTo<ArrayProduct<ProductA>>, ArrayProduct<ProductC>>
// type C = Assert<
//   ConvertibleTo<ArrayProduct<ProductA>>,
//   TupleProduct<[ProductA, TupleProduct<[ProductB, ProductA]>, ArrayProduct<ProductB>]>
// >
// // @ts-expect-error anti-axiom
// type D = Assert<ConvertibleTo<ArrayProduct<ProductA>>, TupleProduct<[]>>

// // type A0 = Assert<A1, A2>
// // type A1 = ConvertibleTo<ProductA>[__convertibleTo];
// // type A2 = TupleProduct<[ProductC]>[__convertibleTo];
// // type A3 = UnionToTuple<
// //   NonNullable<A2> extends infer Y ? Y extends Y ? NonNullable<A1> extends infer X ? X extends X ?
// //     Y extends X ? never : [X, Y]
// //   : never : never : never : never
// // >[3]
// // type A4 = Assert<A3[0], A3[1]>
// // type A5 = A3[1]["x"]
// // type A6 = Assert<ConvertibleTo<ProductA>, ConvertibleTo<ProductB>>;


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

// type UnionToTuple<T> = (
//   (
//       (
//           T extends any
//               ? (t: T) => T
//               : never
//       ) extends infer U
//           ? (U extends any
//               ? (u: U) => any
//               : never
//           ) extends (v: infer V) => any
//               ? V
//               : never
//           : never
//   ) extends (_: any) => infer W
//       ? [...UnionToTuple<Exclude<T, W>>, W]
//       : []
// );
