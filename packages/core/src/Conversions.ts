
import { CompoundProduct } from "./CompoundProduct";
import { Product } from "./Product";

export interface Conversion<A extends Product, B extends Product> {
  (value: A): B,
}

type Values<T> = T[keyof T];

declare global {
  namespace escad {
    interface ConversionsObj { }
  }
}

export type ConversionsUnion<C = ConversionsObj> = Values<{
  [K in keyof C]: C[K] extends Conversion<any, any> ? C[K] : ConversionsUnion<C[K]>
}>

export type DirectConvertibleTo<T, C = ConversionsUnion> = C extends Conversion<infer F, T & Product> ? F : never
export type DirectConvertibleFrom<F, C = ConversionsUnion> = C extends Conversion<F & Product, infer T> ? T : never

interface CompoundConvertibleTo<T extends Product[]> {
  children: { [K in keyof T]: K extends number ? ConvertibleTo<T[K]> : T[K] },
}

interface CompoundConvertibleFrom<T extends Product[]> {
  children: { [K in keyof T]: K extends number ? ConvertibleFrom<T[K]> : T[K] },
}

type _SafeCompoundConvertibleFrom<A> = A extends CompoundProduct<infer T> ? CompoundConvertibleFrom<T> : A;
export type ConvertibleFrom<A, E=never> =
  A extends "__never__" ? never :
      | _SafeCompoundConvertibleFrom<A>
      | ConvertibleFrom<Exclude<DirectConvertibleFrom<_SafeCompoundConvertibleFrom<A>>, E>, E | _SafeCompoundConvertibleFrom<A>>

type _SafeCompoundConvertibleTo<A> = A extends CompoundProduct<infer T> ? CompoundConvertibleTo<T> : A;
export type ConvertibleTo<A, E=never> =
  A extends "__never__" ? never :
      | _SafeCompoundConvertibleTo<A>
      | ConvertibleTo<Exclude<DirectConvertibleTo<_SafeCompoundConvertibleTo<A>>, E>, E | _SafeCompoundConvertibleTo<A>>


export type ConversionsObj = escad.ConversionsObj;
