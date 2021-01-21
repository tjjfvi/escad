
import { Product, _Product, ProductType } from "./Product";

export type TupleProductType<T extends TupleProduct<readonly Product[]>> =
  {
    readonly [K in Exclude<keyof T["children"], keyof any[]>]:
      T["children"][K] extends infer U ? U extends Product ? ProductType<U> : never : never
  }

export interface TupleProduct<T extends readonly Product[]> extends _Product {
  readonly isTupleProduct: true,
  readonly children: T,
}

export const TupleProduct = {
  create: <T extends readonly Product[]>(children: T): TupleProduct<T> => ({
    children,
    isTupleProduct: true,
  }),
  isTupleProduct: (arg: unknown): arg is TupleProduct<readonly Product[]> =>
    typeof arg === "object" &&
    arg !== null &&
    "isTupleProduct" in arg &&
    arg["isTupleProduct" as keyof typeof arg] === true
}
