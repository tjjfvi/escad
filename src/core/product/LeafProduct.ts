import { ScopedId } from "./Id.ts";
import { ConvertibleTo } from "./Conversions.ts";
import { _Product, Product } from "./Product.ts";
import { conversionRegistry } from "./ConversionRegistry.ts";
import { checkTypeProperty } from "./checkTypeProperty.ts";

export interface LeafProduct extends _Product {
  readonly type: ScopedId<"LeafProduct">;
}

export const LeafProduct = {
  isLeafProduct: checkTypeProperty.idScope<LeafProduct>("LeafProduct"),
  getLeafProductType: <T extends LeafProduct>(product: T): LeafProductType<T> =>
    LeafProductType.create(product.type) as any,
};

export const createLeafProductUtils = <P extends LeafProduct, N extends string>(
  id: P["type"],
  name: N,
) => ({
  productType: LeafProductType.create<P>(id),
  ...({
    [`is${name}`]: (q: Product): q is P =>
      Product.isProduct(q, LeafProductType.create(id)),
  } as Record<`is${N}`, (q: Product) => q is P>),
  convert<Q extends ConvertibleTo<P>>(q: Q): Promise<P> {
    return conversionRegistry.convertProduct<P, Q>(
      LeafProductType.create(id),
      q,
    );
  },
});

export interface LeafProductType<T extends LeafProduct = LeafProduct> {
  readonly type: "LeafProductType";
  readonly id: T["type"];
}

export const LeafProductType = {
  create: <T extends LeafProduct>(id: T["type"]): LeafProductType<T> => ({
    type: "LeafProductType",
    id,
  }),
  isLeafProductType: checkTypeProperty.string<LeafProductType>(
    "LeafProductType",
  ),
};
