import {
  conversionRegistry,
  ConvertibleTo,
  Element,
  GenericComponent,
  type Hkt,
  Operation,
  Product,
  ProductType,
  ProductTypeish,
} from "../core/mod.ts";

export interface ConvertArgsHkt extends Hkt<[Product]> {
  [Hkt.output]: [productTypeish: ProductTypeish<Hkt.Input<this>[0]>];
}

export interface ConvertReturnHkt extends Hkt<[Product]> {
  [Hkt.output]: Operation<
    ConvertibleTo<Hkt.Input<this>[0]>,
    Hkt.Input<this>[0]
  >;
}

export const convert = GenericComponent.create<
  [Product],
  ConvertArgsHkt,
  ConvertReturnHkt
>(
  "convert",
  <U extends Product>(productTypeish: ProductTypeish<U>) => {
    const productType = ProductType.fromProductTypeish(productTypeish);
    return Operation.create(
      "convert",
      (element) =>
        Element.map(
          element,
          (product) =>
            Element.create(
              conversionRegistry.convertProduct(productType, product),
            ),
        ),
      { showOutput: false },
    );
  },
  { showOutput: false },
);
