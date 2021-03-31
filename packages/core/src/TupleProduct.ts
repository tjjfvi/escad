
import { checkTypeProperty } from "./checkTypeProperty"
import { Product, _Product, ProductType } from "./Product"

export interface TupleProduct<T extends readonly Product[] = readonly Product[]> extends _Product {
  readonly type: "TupleProduct",
  readonly children: T,
}

export const TupleProduct = {
  create: <T extends readonly Product[]>(children: T): TupleProduct<T> => ({
    type: "TupleProduct",
    children,
  }),
  isTupleProduct: checkTypeProperty.string<TupleProduct>("TupleProduct"),
  getTupleProductType: <T extends TupleProduct>(product: T): TupleProductType<T> =>
    TupleProductType.create(product.children.map(Product.getProductType)) as any,
}

export interface TupleProductType<T extends TupleProduct = TupleProduct> {
  readonly type: "TupleProductType",
  readonly elementTypes: (
    T extends TupleProduct<infer U>
      ? ProductTypeTupleMap<U>
      : never
  ),
}

type ProductTypeTupleMap<T extends readonly Product[]> =
  { [K in keyof T]: T[K] extends Product ? ProductType<T[K]> : T[K] }

export const TupleProductType = {
  create: <T extends readonly Product[]>(
    elementTypes: [...ProductTypeTupleMap<T>],
  ): TupleProductType<TupleProduct<T>> => ({
    type: "TupleProductType",
    elementTypes,
  }),
  isTupleProductType: checkTypeProperty.string<TupleProductType>("TupleProductType"),
}
