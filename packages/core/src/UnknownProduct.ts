
import { Product, _Product } from "./Product"
import { checkTypeProperty } from "./checkTypeProperty"

export interface UnknownProduct extends _Product {
  readonly type: "UnknownProduct",
  readonly product: Product,
}

export const UnknownProduct = {
  create: (product: Product): UnknownProduct => ({
    type: "UnknownProduct",
    product,
  }),
  isUnknownProduct: checkTypeProperty.string<UnknownProduct>("UnknownProduct"),
}

export interface UnknownProductType {
  readonly type: "UnknownProductType",
}

export const UnknownProductType = {
  create: (): UnknownProductType => ({
    type: "UnknownProductType",
  }),
  isUnknownProductType: checkTypeProperty.string<UnknownProductType>("UnknownProductType"),
}
