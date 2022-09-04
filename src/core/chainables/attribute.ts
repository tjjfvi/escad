import { conversionRegistry, ConvertibleTo } from "../conversions/mod.ts";
import { type Hkt, Id } from "../utils/mod.ts";
import { GenericComponent, mapOperation, Operation } from "../chaining/mod.ts";
import {
  createLeafProductUtils,
  LeafProduct,
  Product,
  ProductType,
  ProductTypeish,
} from "../product/mod.ts";

type StringKeys<T> = `${Exclude<keyof T, symbol>}`;
type GetStringKey<T, K extends StringKeys<T>> = K extends keyof T ? T[K]
  : T[number & keyof T];
type AutoPath<O, P extends string> = P extends `${infer A}.${infer B}`
  ? A extends StringKeys<O> ? `${A}.${AutoPath<GetStringKey<O, A>, B>}`
  : never
  : P extends StringKeys<O> ? 
      | P
      | `${P}.`
  : StringKeys<O>;
type GetPath<O, P extends string> = P extends `${infer A}.${infer B}`
  ? A extends StringKeys<O> ? GetPath<GetStringKey<O, A>, B>
  : never
  : P extends StringKeys<O> ? GetStringKey<O, P>
  : never;

export interface AttributeArgsHkt extends Hkt<[Product, string]> {
  [Hkt.output]: [
    productType: ProductTypeish<Hkt.Input<this>[0]>,
    path: AutoPath<Hkt.Input<this>[0], Hkt.Input<this>[1]>,
  ];
}

type MaybeWrapAttributeValue<T> = T extends Product ? T
  : ValueWrapperProduct<T>;
type AttributeReturn<T extends Product, P extends string> = Operation<
  ConvertibleTo<T>,
  MaybeWrapAttributeValue<GetPath<T, P>>
>;
export interface AttributeReturnHkt extends Hkt<[Product, string]> {
  [Hkt.output]: AttributeReturn<Hkt.Input<this>[0], Hkt.Input<this>[1]>;
}

export const attribute = GenericComponent.create<
  [Product, string],
  AttributeArgsHkt,
  AttributeReturnHkt
>(
  "attribute",
  (productType, path) =>
    mapOperation("attribute", async (rawProduct) => {
      const product = await conversionRegistry.convertProduct(
        ProductType.fromProductTypeish(productType),
        rawProduct,
      );
      const value: unknown = path.split(".").reduce<any>(
        (obj, part) => obj[part],
        product,
      );
      const wrappedValue = Product.isProduct(value)
        ? value
        : ValueWrapperProduct.create(rawProduct);
      return wrappedValue as any;
    }, { showOutput: false }),
  { showOutput: false },
);

const valueWrapperProductId = Id.create(
  import.meta.url,
  "@escad/core",
  "LeafProduct",
  "ValueWrapperProduct",
);

export interface ValueWrapperProduct<T = unknown> extends LeafProduct {
  readonly type: typeof valueWrapperProductId;
  readonly value: T;
}

export const ValueWrapperProduct = {
  create: <T>(value: T): ValueWrapperProduct<T> => ({
    type: valueWrapperProductId,
    value,
  }),
  ...createLeafProductUtils<ValueWrapperProduct, "ValueWrapperProduct">(
    valueWrapperProductId,
    "ValueWrapperProduct",
  ),
  id: valueWrapperProductId,
};
