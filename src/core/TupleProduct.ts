
import { checkTypeProperty } from "./checkTypeProperty.ts"
import { Product, _Product, ProductType, ProductTypeish } from "./Product.ts"

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
    TupleProductType.create(product.children.map(Product.getProductType) as never) as never,
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
type ProductTypeishTupleMap<T extends readonly Product[]> =
  { [K in keyof T]: T[K] extends Product ? ProductTypeish<T[K]> : T[K] }

export const TupleProductType = {
  create: <T extends readonly Product[]>(
    elementTypes: [...ProductTypeishTupleMap<T>],
  ): TupleProductType<TupleProduct<T>> => ({
    type: "TupleProductType",
    elementTypes: elementTypes.map(productTypeish => ProductType.fromProductTypeish(productTypeish as never)) as never,
  }),
  isTupleProductType: checkTypeProperty.string<TupleProductType>("TupleProductType"),
}
