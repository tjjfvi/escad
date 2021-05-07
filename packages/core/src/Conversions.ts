
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

declare global {
  namespace escad {
    interface ConversionsObj extends Record<string, Conversion<any, any>> { }
  }
}

type ConversionsUnion =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  escad.ConversionsObj extends Record<infer _, infer T>
    ? T extends T
      ? Conversion<0, 0> extends T
        ? never
        : T
      : never
    : never

export declare const __convertibleTo: unique symbol
export declare const __convertibleToOverride: unique symbol
export type __convertibleTo = typeof __convertibleTo
export type __convertibleToOverride = typeof __convertibleToOverride

type U2I<U> = (U extends U ? (u: U) => 0 : never) extends (i: infer I) => 0 ? I : never

type Match<T, U> = keyof U extends keyof T ? Pick<T, keyof U> extends U ? true : false : false

type CovariantMergeableEach<T> = T extends CovariantMergeable<unknown> ? T : CovariantMergeable<T>
interface CovariantMergeable<T> {
  _covariantMergable: () => T,
}

// A is assignable to B, and B is assignable to C, but A is not assignable to C
export namespace TransitivityOverride {
  export type A = (x?: true) => never
  export type B = () => true
  export type C = (x?: false) => boolean
}

// X<A> is always assignable to X<B>, but X<A>|Y<A> is only assignable to Y<B> iff A is assignable to B
export namespace CrossAssignable {
  export type Undo<T> = T extends [TransitivityOverride.A, infer U] ? U : never
  export type X<T> = [TransitivityOverride.A, T] | [TransitivityOverride.B, unknown]
  export type Y<T> = [TransitivityOverride.A, T] | [TransitivityOverride.C, unknown]
}

type _WrappedConvertibleToEach<T, E=never> = T extends T ? [_ConvertibleTo<T, E>] : never
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
      ? number extends keyof A["children"]
        ? readonly Product[] extends A["children"]
          ? unknown
          : U2I<_WrappedConvertibleToEach<A["children"][number], E> | [unknown]>[0]
        : never
      // ? A["children"] extends [infer A, ...infer B]
      //   ? { type: "_defer", value: _ConvertibleTo<A, E> & _ConvertibleTo<{ type: "AndProduct", children: B }> }
      //   : { type: "_defer", value: _ConvertibleTo<A["children"][0 & keyof A["children"]], E> }
      : never
  : A
: never>

type _DirectConvertibleTo<T, E = never, C = ConversionsUnion> =
  C extends Conversion<infer F, infer T2>
    ? _ImplicitlyConvertibleTo<Omit<T2, __convertibleTo>, E> extends _ImplicitlyConvertibleTo<T, E>
      ? Omit<F, __convertibleTo>
      : never
    : never

export type _ConvertibleTo<T, E=never> = T extends E ? never : __ConvertibleTo<Omit<T, __convertibleTo>, E>
type __ConvertibleTo<T, E=never> =
  T extends T
    ? __convertibleToOverride extends keyof T
      ? _ConvertibleTo<Unphantom<T[__convertibleToOverride]>>
      : _ImplicitlyConvertibleTo<T, E | T | _ImplicitlyConvertibleTo<T, E>>
      | _ConvertibleTo<_DirectConvertibleTo<T, E>, E | T | _ImplicitlyConvertibleTo<T, E>>
    : never

// Preserves type info but does not affect assignability
export interface Phantom<T> { _: Phantom<T> }
export type Unphantom<T> = T extends Phantom<infer U> ? U : never

export type ConvertibleTo<T extends Product> = Product & {
  [__convertibleToOverride]?: Phantom<T>,
  [__convertibleTo]?: CrossAssignable.Y<CrossAssignable.Undo<T[__convertibleTo]>>,
}

/* Tests */

import escad, { ArrayProduct, LeafProduct, TupleProduct } from "."
import { AndProduct } from "./AndProduct"

declare global {
  namespace escad {
    interface ConversionsObj {
      "@escad/core/Conversions": (
        | Conversion<P<"A">, P<"B">>
        | Conversion<P<"B">, P<"A">>
        | Conversion<ArrayProduct<P<"A">>, P<"A">>
        // | Conversion<P<"X">, AndProduct<[P<"A">, P<"B">]>>
        // | Conversion<P<"Y">, P<"X">>
        | Conversion<AndProduct<[P<"Y">, P<"Z">]>, Q<"X">>
      ),
    }
  }
}

type X<T extends string, U extends T> = Assert<P<T>, P<U>>

type asdf = CrossAssignable.Undo<P<"A">[__convertibleTo]>
type asadf = ConvertibleTo<P<"A">>[__convertibleTo]

type Assert<T, U extends T> = U
interface P<T extends string> extends LeafProduct {
  readonly type: Id<"@escad/core", "LeafProduct", "ConversionsTests", T>,
}
interface Q<T extends string> extends LeafProduct {
  readonly type: Id<"@escad/core", "LeafProduct", "ConversionsTests", T>,
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Tests<B extends Product, A extends ConvertibleTo<B>> = [
  Assert<ConvertibleTo<P<"A">>, P<"A">>,
  Assert<ConvertibleTo<ArrayProduct<P<"A">>>, ArrayProduct<P<"B">>>,
  Assert<
    ConvertibleTo<ArrayProduct<P<"A">>>,
    TupleProduct<[P<"A">, TupleProduct<[P<"B">, P<"A">]>, ArrayProduct<P<"B">>]>
  >,
  Assert<ConvertibleTo<P<"A">>, ArrayProduct<ConvertibleTo<P<"A">>>>,
  Assert<ConvertibleTo<P<"A">>, TupleProduct<ConvertibleTo<P<"A">>[]>>,
  Assert< ConvertibleTo<TupleProduct<[P<"C">, P<"A">]>>, TupleProduct<[P<"C">, TupleProduct<ConvertibleTo<P<"A">>[]>]>>,
  Assert<_ConvertibleTo<A>, _ConvertibleTo<ConvertibleTo<A>>>,
  Assert<ConvertibleTo<A>, ConvertibleTo<ConvertibleTo<A>>>,
  Assert<ConvertibleTo<B>, ConvertibleTo<A>>,
  Assert<ConvertibleTo<P<"B">>, ConvertibleTo<P<"A">>>,
  Assert<ConvertibleTo<P<"B">>, ConvertibleTo<P<"A">>>,
  Assert<ConvertibleTo<P<"B">>, ConvertibleTo<TupleProduct<[P<"B">, P<"A">]>>>,
  Assert<ConvertibleTo<P<"B">>, AndProduct<[P<"B">, P<"A">]>>,
  Assert<ConvertibleTo<P<"A">>, AndProduct<[P<"C">, P<"A">]>>,
  Assert<ConvertibleTo<P<"B">>, AndProduct<[P<"C">, P<"B">]>>,
  Assert<ConvertibleTo<P<"C">>, AndProduct<[P<"C">, P<"B">]>>,
  Assert<ConvertibleTo<AndProduct<[P<"A">, P<"B">]>>, AndProduct<[P<"B">, P<"A">]>>,
  Assert<ConvertibleTo<AndProduct<[P<"A">]>>, AndProduct<[P<"B">, P<"A">]>>,
  Assert<ConvertibleTo<AndProduct<[]>>, P<"B">>,
  Assert<ConvertibleTo<AndProduct<[P<"C">, P<"A">]>>, AndProduct<[P<"A">, P<"C">]>>,
  Assert<ConvertibleTo<AndProduct<[P<"A">, P<"B">]>>, P<"A">>,
  Assert<ConvertibleTo<AndProduct<[P<"A">, P<"B">]>>, TupleProduct<[P<"A">, P<"B">, P<"A">]>>,
  Assert<ConvertibleTo<AndProduct<[P<"C">]>>, P<"C">>,
  Assert<ConvertibleTo<AndProduct<[P<"A">, P<"B">]>>, P<"A">>,
  Assert<ConvertibleTo<AndProduct<[P<"A">, P<"B">]>>, P<"B">>,
  // Assert<ConvertibleTo<P<"X">>, P<"Z">>,
  // @ts-expect-error
  Assert<ConvertibleTo<AndProduct<[P<"C">]>>, AndProduct<[P<"B">, P<"A">]>>,
  // @ts-expect-error
  Assert<ConvertibleTo<AndProduct<[P<"A">, P<"B">]>>, P<"C">>,
  // @ts-expect-error
  Assert<ConvertibleTo<TupleProduct<[AndProduct<[P<"A">, P<"B">]>]>>, TupleProduct<[P<"C">]>>,
  // @ts-expect-error
  Assert<ConvertibleTo<AndProduct<[P<"C">, P<"A">]>>, P<"C">>,
  // @ts-expect-error
  Assert<ConvertibleTo<AndProduct<[P<"C">, P<"A">]>>, P<"A">>,
  // @ts-expect-error
  Assert<ConvertibleTo<P<"A">>, TupleProduct<[P<"A">, P<"C">, P<"A">]>>,
  // @ts-expect-error
  Assert<ConvertibleTo<P<"B">>, TupleProduct<[P<"A">, P<"C">, P<"A">]>>,
  // @ts-expect-error
  Assert<ConvertibleTo<AndProduct<[P<"A">, P<"B">]>>, TupleProduct<[P<"A">, P<"C">, P<"A">]>>,
  // @ts-expect-error
  Assert<ConvertibleTo<ArrayProduct<P<"A">>>, ArrayProduct<P<"C">>>,
]
