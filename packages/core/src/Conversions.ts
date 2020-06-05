
import { Product } from "./Product";
import { StrictLeaf } from "./Leaf";

export interface Conversion<A extends Product<A>, B extends Product<B>> {
  (value: StrictLeaf<A>): StrictLeaf<B>,
  isComposition?: boolean,
}

type Values<T> = T[keyof T];

export type CompiledConversions<C = ConversionsObj> =
  C extends Conversion<any, any> ?
  C :
  Values<{
    [K in keyof C]: CompiledConversions<C[K]>
  }>

type ExtractProduct<T> = T;

export type ConvertibleFrom<T extends Product<T>, E = never> = ExtractProduct<
  T | {
    0: ConvertibleFrom<ExtractProduct<Exclude<DirectConvertibleFrom<T>, T | E>>, T | E>,
  }[T extends any ? 0 : never]
>

export type ConvertibleTo<T extends Product<T>, E = never> = ExtractProduct<
  T | {
    0: ConvertibleTo<ExtractProduct<Exclude<DirectConvertibleTo<T>, T | E>>, T | E>,
  }[T extends any ? 0 : never]
>

export type DirectConvertibleFrom<T extends Product<T>> =
  Extract<CompiledConversions, Conversion<T, any>> extends Conversion<T, infer O> ? Extract<O, Product<O>> : never;

export type DirectConvertibleTo<T extends Product<T>> =
  Extract<CompiledConversions, Conversion<any, T>> extends Conversion<infer O, T> ? Extract<O, Product<O>> : never;

declare global {
  namespace escad {
    interface ConversionsObj { }
  }
}

export type ConversionsObj = escad.ConversionsObj;
