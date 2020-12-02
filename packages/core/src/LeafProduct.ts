
import { Id } from "./Id";
import { ConvertibleTo } from "./Conversions";
import { Product, ProductType, _Product } from "./Product";
import { conversionRegistry } from "./ConversionRegistry";

export type LeafProductType<T extends LeafProduct> = T["type"];

export interface LeafProduct extends _Product {
  readonly type: Id,
}

export const LeafProduct = {
  isLeafProduct: (arg: unknown): arg is LeafProduct =>
    typeof arg === "object" && arg !== null && "type" in arg && Id.isId(arg["type" as keyof typeof arg])
};

export const createProductTypeUtils = <P extends LeafProduct, N extends string>(id: ProductType<P>, name: N) => ({
  ...({
    [`is${name}`]: (q: Product): q is P =>
      LeafProduct.isLeafProduct(q) && q.type === id,
  } as Record<`is${N}`, (q: Product) => q is P>),
  convert<Q extends ConvertibleTo<P>>(q: Q): Promise<P>{
    return conversionRegistry.convertProduct<P, Q>(id, q);
  }
});
