
import { checkTypeProperty } from "./checkTypeProperty";
import { Product, _Product, ProductType } from "./Product";

export interface ArrayProduct<T extends Product = Product> extends _Product {
  readonly type: "ArrayProduct",
  readonly children: readonly T[],
}

export const ArrayProduct = {
  create: <T extends Product>(children: readonly T[]): ArrayProduct<T> => {
    if(children.length === 0)
      throw new Error("ArrayProducts cannot be empty");
    const childProductType = Product.getProductType(children[0]);
    if(children.slice(1).some(x => !Product.isProduct(x, childProductType)))
      throw new Error("ArrayProduct children must all be of the same product type");
    return {
      type: "ArrayProduct",
      children,
    };
  },
  isArrayProduct: checkTypeProperty<ArrayProduct>("ArrayProduct"),
  getArrayProductType: <T extends ArrayProduct>(product: T): ArrayProductType<T> =>
    ArrayProductType.create(Product.getProductType(product.children[0])) as any
}

export interface ArrayProductType<T extends ArrayProduct = ArrayProduct> {
  readonly type: "ArrayProductType",
  readonly elementType: ProductType<T extends ArrayProduct<infer U> ? U : never>,
}

export const ArrayProductType = {
  create: (elementType: ProductType): ArrayProductType => ({
    type: "ArrayProductType",
    elementType,
  }),
  isArrayProductType: checkTypeProperty<ArrayProductType>("ArrayProductType"),
}
