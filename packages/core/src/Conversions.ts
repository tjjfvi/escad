
import { Hash } from "./Hash"
import { Id, ScopedId } from "./Id"
import { Product, ProductType, ProductTypeish } from "./Product"

export interface Conversion<A, B> {
  (value: A): B,
}

export interface ConversionImpl<A extends Product, B extends Product> extends ConversionImplish<A, B> {
  readonly fromType: ProductType<A>,
  readonly toType: ProductType<B>,
}

export interface ConversionImplish<A extends Product, B extends Product> {
  readonly convert: (value: A) => Promise<B>,
  readonly fromType: ProductTypeish<A>,
  readonly toType: ProductTypeish<B>,
  readonly weight: number,
  readonly id: ScopedId<"Conversion"> | Hash<unknown>,
}

type Values<T> = T[keyof T]

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
)

export declare const __convertibleTo: unique symbol
export declare const __convertibleToOverride: unique symbol
export declare const __convertibleToTransitivityOverride: unique symbol
export type __convertibleTo = typeof __convertibleTo
export type __convertibleToOverride = typeof __convertibleToOverride
export type __convertibleToTransitivityOverride = typeof __convertibleToTransitivityOverride

// A is assignable to B, and B is assignable to C, but A is not assignable to C
export namespace TransitivityOverride {
  export type A = (x?: true) => never
  export type B = () => true
  export type C = (x?: false) => boolean
}

type U2I<U> = (U extends U ? (u: U) => 0 : never) extends (i: infer I) => 0 ? I : never

type Match<T, U> = keyof U extends keyof T ? Pick<T, keyof U> extends U ? true : false : false

type CovariantMergeable<T> = {
  (): CovariantMergeable<T>,
  _covariantMergable: true,
  // x: { x: T },
}
type CovariantMergeableEach<T> = CovariantMergeable<T>

// type asdfgfd<T> = T  extends { x: { x: infer U } } ? U : never
// type defefs = CovariantMergeable<1> & CovariantMergeable<2>
// type afs = { x: { x: 1 } } & { x: { x: 2 } } extends never ? true : false

type _ImplicitlyConvertibleTo<A, E=never> = CovariantMergeableEach<A extends A ?
  | Match<A, { type: "TupleProduct" }> extends true
    ? "children" extends keyof A
      ? {
        readonly type: "TupleProduct",
        readonly children: {
          readonly [K in keyof A["children"] & (number | `${number}`)]: _ConvertibleTo<A["children"][K]>
        },
      }
      : never
  : Match<A, { type: "ArrayProduct" }> extends true
    ? "children" extends keyof A
      ? number extends keyof A["children"]
        ? {
          readonly type: "ArrayProduct",
          readonly children: readonly _ConvertibleTo<A["children"][number]>[],
        }
        | {
          readonly type: "TupleProduct",
          readonly children: Readonly<Record<number, _ConvertibleTo<A["children"][number]>>>,
        }
        : never
      : never
  : Match<A, { type: "MarkedProduct" }> extends true
    ? "child" extends keyof A
      ? {
        readonly type: "MarkedProduct",
        readonly child: _ConvertibleTo<A["child"]>,
      }
      : never
  : Match<A, { type: "AndProduct" }> extends true
    ? "children" extends keyof A
      ? U2I<(A["children"][number & keyof A["children"]] extends infer T ? T extends T ? {
          x: _ConvertibleTo<T, E>,
        } : never : never) | { x: unknown }>["x"]
      : never
  : A
: never>

type _DirectConvertibleTo<T, E = never, C = ConversionsUnion> =
  C extends Conversion<infer F, infer T2>
    ? _ImplicitlyConvertibleTo<Omit<T2, __convertibleTo>, E> extends _ImplicitlyConvertibleTo<T, E>
      ? Omit<F, __convertibleTo>
      : never
    : never

export type _ConvertibleTo<T, E=never> =
  T extends T
    ? __convertibleToOverride extends keyof T
      ? _ConvertibleTo<Unphantom<T[__convertibleToOverride]>>
      // : Exclude<T, { type: "AndProduct" }>
      : _ImplicitlyConvertibleTo<T, E>
      | (
        T extends E
          ? never
          : _ConvertibleTo<_DirectConvertibleTo<T, E>, E | T | _ImplicitlyConvertibleTo<T, E>>
      )
      | CovariantMergeable<{
        [__convertibleTo]?: _ConvertibleTo<T, E> | T[Extract<__convertibleTo, keyof T>],
        [__convertibleToTransitivityOverride]?: TransitivityOverride.C,
      }>
    : never

// Preserves type info but does not affect assignability
export interface Phantom<T> { _: Phantom<T> }
export type Unphantom<T> = T extends Phantom<infer U> ? U : never

export type ConvertibleTo<T extends Product> = Product & {
  [__convertibleToTransitivityOverride]?: TransitivityOverride.B,
  [__convertibleToOverride]?: Phantom<T>,
  [__convertibleTo]?: T[__convertibleTo],
}

/* Tests */

import { ArrayProduct, LeafProduct, TupleProduct } from "."
import { AndProduct } from "./AndProduct"

declare global {
  namespace escad {
    interface ConversionsObj {
      "@escad/core/Conversions":
        | Conversion<ProductA, ProductB>
        | Conversion<ProductB, ProductA>
        | Conversion<ArrayProduct<ProductA>, ProductA>,
    }
  }
}

type Assert<T, U extends T> = U
interface ProductA extends LeafProduct {
  type: Id<"@escad/core", "LeafProduct", "ConversionsTests", "ProductA">,
  a: 5,
}
interface ProductB extends LeafProduct {
  type: Id<"@escad/core", "LeafProduct", "ConversionsTests", "ProductB">,
  b: 5,
}
interface ProductC extends LeafProduct {
  type: Id<"@escad/core", "LeafProduct", "ConversionsTests", "ProductC">,
  c: 5,
}

type adfds = Assert<never, TupleProduct<[ProductA, ProductC]>[__convertibleTo]>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Tests<B extends Product, A extends ConvertibleTo<B>, T, U extends T> = [
  Assert<CovariantMergeable<T>, CovariantMergeable<CovariantMergeable<T>>>,
  Assert<ConvertibleTo<ArrayProduct<ProductA>>, ArrayProduct<ProductB>>,
  Assert<
    ConvertibleTo<ArrayProduct<ProductA>>,
    TupleProduct<[ProductA, TupleProduct<[ProductB, ProductA]>, ArrayProduct<ProductB>]>
  >,
  Assert<ConvertibleTo<ProductA>, ArrayProduct<ConvertibleTo<ProductA>>>,
  Assert<ConvertibleTo<ProductA>, TupleProduct<ConvertibleTo<ProductA>[]>>,
  Assert<
    ConvertibleTo<TupleProduct<[ProductC, ProductA]>>,
    TupleProduct<[ProductC, TupleProduct<ConvertibleTo<ProductA>[]>]>
  >,
  Assert<_ConvertibleTo<A>, _ConvertibleTo<ConvertibleTo<A>>>,
  Assert<ConvertibleTo<A>, ConvertibleTo<ConvertibleTo<A>>>,
  Assert<ConvertibleTo<B>, ConvertibleTo<A>>,
  Assert<ConvertibleTo<ProductB>, ConvertibleTo<ProductA>>,
  Assert<ConvertibleTo<ProductB>, ConvertibleTo<ProductA>>,
  Assert<ConvertibleTo<ProductB>, ConvertibleTo<TupleProduct<[ProductB, ProductA]>>>,
  Assert<ConvertibleTo<ProductB>, AndProduct<[ProductB, ProductA]>>,
  Assert<ConvertibleTo<ProductA>, AndProduct<[ProductC, ProductA]>>,
  Assert<ConvertibleTo<ProductB>, AndProduct<[ProductC, ProductB]>>,
  Assert<ConvertibleTo<ProductC>, AndProduct<[ProductC, ProductB]>>,
  Assert<ConvertibleTo<AndProduct<[ProductA, ProductB]>>, AndProduct<[ProductB, ProductA]>>,
  Assert<ConvertibleTo<AndProduct<[ProductA]>>, AndProduct<[ProductB, ProductA]>>,
  Assert<ConvertibleTo<AndProduct<[]>>, ProductB>,
  Assert<ConvertibleTo<AndProduct<[ProductC, ProductA]>>, AndProduct<[ProductA, ProductC]>>,
  Assert<ConvertibleTo<AndProduct<[ProductA, ProductB]>>, ProductA>,
  Assert<ConvertibleTo<AndProduct<[ProductA, ProductB]>>, TupleProduct<[ProductA, ProductB, ProductA]>>,
  Assert<ConvertibleTo<AndProduct<[ProductC]>>, ProductC>,
  Assert<ConvertibleTo<AndProduct<[ProductA, ProductB]>>, ProductA>,
  Assert<ConvertibleTo<AndProduct<[ProductA, ProductB]>>, ProductB>,
  // @ts-expect-error
  Assert<ConvertibleTo<AndProduct<[ProductC]>>, AndProduct<[ProductB, ProductA]>>,
  // @ts-expect-error
  Assert<ConvertibleTo<AndProduct<[ProductC, ProductA]>>, ProductC>,
  // @ts-expect-error
  Assert<ConvertibleTo<AndProduct<[ProductC, ProductA]>>, ProductA>,
  // @ts-expect-error
  Assert<ConvertibleTo<ProductA>, TupleProduct<[ProductA, ProductC, ProductA]>>,
  // @ts-expect-error
  Assert<ConvertibleTo<ProductB>, TupleProduct<[ProductA, ProductC, ProductA]>>,
  // @ts-expect-error
  Assert<ConvertibleTo<AndProduct<[ProductA, ProductB]>>, TupleProduct<[ProductA, ProductC, ProductA]>>,
  // @ts-expect-error
  Assert<ConvertibleTo<ArrayProduct<ProductA>>, ArrayProduct<ProductC>>,
]
