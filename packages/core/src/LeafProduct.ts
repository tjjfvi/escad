
import { Id } from "./Id";
import { ConvertibleTo } from "./Conversions";
import { Product, ProductType, _Product } from "./Product";

export type LeafProductType<T extends LeafProduct> = any extends T ? Id : T["type"];

export interface LeafProduct extends _Product {
  readonly type: Id,
}

export const LeafProduct = {
  isLeafProduct: (arg: unknown): arg is LeafProduct =>
    typeof arg === "object" && arg !== null && "type" in arg && Id.isId(arg["type" as keyof typeof arg])
};

export const createProductTypeUtils = <P extends LeafProduct, N extends string>(id: ProductType<P>, name: N) => ({
  [`is${name}` as `is${N}`]: (q: Product): q is P =>
    LeafProduct.isLeafProduct(q) && q.type === id,
  convert<Q extends ConvertibleTo<P>>(q: Q): Promise<P>{
    return Product.ConversionRegistry.convertProduct<P, Q>(id, q);
  }
});
