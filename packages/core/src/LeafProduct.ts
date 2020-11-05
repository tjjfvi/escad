
import { Id } from "./Id";
import { ConvertibleTo } from "./Conversions";
import { Product, ProductType, _Product } from "./Product";

export type LeafProductType<T extends LeafProduct> = any extends T ? Id : T["type"];

export interface LeafProduct extends _Product {
  readonly type: Id,
}

export const LeafProduct = {
  isLeafProduct: (arg: any): arg is LeafProduct =>
    typeof arg === "object" && Id.isId(arg.type)
};

export const createProductTypeUtils = <P extends LeafProduct>(id: ProductType<P>) => ({
  convert<Q extends ConvertibleTo<P>>(q: Q): Promise<P>{
    return Product.ConversionRegistry.convertProduct<P, Q>(id, q);
  }
});
