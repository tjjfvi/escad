import { Product, _Product, checkTypeProperty, ProductType } from "."

export interface AndProduct<T extends readonly Product[] = readonly Product[]> extends _Product {
  readonly type: "AndProduct",
  readonly children: T,
}

export const AndProduct = {
  create: <T extends readonly Product[]>(children: T): AndProduct<T> => ({
    type: "AndProduct",
    children,
  }),
  isAndProduct: checkTypeProperty.string<AndProduct>("AndProduct"),
  getAndProductType: <T extends AndProduct>(product: T): AndProductType<T> =>
    AndProductType.create(product.children.map(Product.getProductType)) as any,
}

export interface AndProductType<T extends AndProduct = AndProduct> {
  readonly type: "AndProductType",
  readonly elementTypes: (
    T extends AndProduct<infer U>
      ? { [K in keyof U]: U[K] extends Product ? ProductType<U[K]> : never }
      : never
  ),
}

export const AndProductType = {
  create: (elementTypes: ProductType[]): AndProductType => ({
    type: "AndProductType",
    elementTypes,
  }),
  isAndProductType: checkTypeProperty.string<AndProductType>("AndProductType"),
  getAndProductType: <T extends AndProduct>(product: T): AndProductType<T> =>
    AndProductType.create(product.children.map(x => Product.getProductType(x))) as any,
}
