
import {
  ConvertibleTo,
  GenericComponent,
  Hkt,
  Operation,
  Product,
  ProductType,
  Element,
  conversionRegistry,
} from "@escad/core"

type ProductTypeish<T extends Product> = ProductType<T> | { productType: ProductType<T> }

export interface ConvertArgsHkt extends Hkt<Product> {
  [Hkt.output]: [productTypeish: ProductTypeish<Hkt.Input<this>>],
}

export interface ConvertReturnHkt extends Hkt<Product> {
  [Hkt.output]: Operation<ConvertibleTo<Hkt.Input<this>>, Hkt.Input<this>>,
}

export const convert = GenericComponent.create<Product, ConvertArgsHkt, ConvertReturnHkt>(
  "convert",
  <U extends Product>(productTypeish: ProductTypeish<U>) => {
    const productType = ProductType.isProductType(productTypeish) ? productTypeish : productTypeish.productType
    return Operation.create(
      "convert",
      element => Element.map(element, product =>
        Element.create(conversionRegistry.convertProduct(productType, product)),
      ),
    )
  },
)
