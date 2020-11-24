
import { Product, _Product, ProductType } from "./Product";

export type CompoundProductType<T extends CompoundProduct<readonly Product[]>> =
  {
    readonly [K in Exclude<keyof T["children"], keyof any[]>]:
      T["children"][K] extends infer U ? U extends Product ? ProductType<U> : never : never
  }

export interface CompoundProduct<T extends readonly Product[]> extends _Product {
  readonly isCompoundProduct: true,
  readonly children: T,
}

export const CompoundProduct = Object.assign(
  <T extends readonly Product[]>(children: T): CompoundProduct<T> => ({
    children,
    isCompoundProduct: true,
  }), {
    isCompoundProduct: (arg: unknown): arg is CompoundProduct<readonly Product[]> =>
      typeof arg === "object" &&
    arg !== null &&
    "isCompoundProduct" in arg &&
    arg["isCompoundProduct" as keyof typeof arg] === true
  }
)
