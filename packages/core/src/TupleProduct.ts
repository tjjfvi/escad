
import { checkTypeProperty } from "./checkTypeProperty";
import { Product, _Product, ProductType } from "./Product";

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
      ? { [K in keyof U]: U[K] extends Product ? ProductType<U[K]> : never }
      : never
  ),
}

export const TupleProductType = {
  create: (elementTypes: ProductType[]): TupleProductType => ({
    type: "TupleProductType",
    elementTypes,
  }),
  isTupleProductType: checkTypeProperty.string<TupleProductType>("TupleProductType"),
}
