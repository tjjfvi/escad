
import { ScopedId } from "./Id.ts"
import { Product, ProductType, ProductTypeish, _Product } from "./Product.ts"
import { checkTypeProperty } from "./checkTypeProperty.ts"

export type Marker = ScopedId<"Marker">

export interface MarkedProduct<T extends Marker = Marker, U extends Product = Product> extends _Product {
  readonly type: "MarkedProduct",
  readonly marker: T,
  readonly child: U,
}

export const MarkedProduct = {
  create: <T extends Marker, U extends Product>(marker: T, child: U): MarkedProduct<T, U> => ({
    type: "MarkedProduct",
    marker,
    child,
  }),
  isMarkedProduct: checkTypeProperty.string<MarkedProduct>("MarkedProduct"),
  getMarkedProductType: <T extends MarkedProduct>(product: T): MarkedProductType<T> =>
    MarkedProductType.create(product.marker, Product.getProductType(product.child)) as never,
  for: <T extends Marker>(marker: T) => ({
    create: <U extends Product>(child: U) => MarkedProduct.create(marker, child),
    createProductType: <U extends Product>(child: ProductTypeish<U>) => MarkedProductType.create(marker, child),
  }),
}

export interface MarkedProductType<T extends MarkedProduct = MarkedProduct> {
  readonly type: "MarkedProductType",
  readonly marker: T["marker"],
  readonly child: ProductType<T["child"]>,
}

export const MarkedProductType = {
  create: <T extends Marker, U extends Product>(
    marker: T,
    child: ProductTypeish<U>,
  ): MarkedProductType<MarkedProduct<T, U>> => ({
    type: "MarkedProductType",
    marker,
    child: ProductType.fromProductTypeish(child),
  }),
  isMarkedProductType: checkTypeProperty.string<MarkedProductType>("MarkedProductType"),
}
