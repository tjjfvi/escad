
import { Id } from "./Id";
import { ConvertibleTo } from "./Conversions";
import { Product, _Product } from "./Product";
import { conversionRegistry } from "./ConversionRegistry";
import { checkTypeProperty } from "./checkTypeProperty";

export interface LeafProduct extends _Product {
  readonly type: Id,
}

export const LeafProduct = {
  isLeafProduct: (arg: unknown): arg is LeafProduct =>
    typeof arg === "object" && arg !== null && "type" in arg && Id.isId(arg["type" as keyof typeof arg]),
  getLeafProductType: <T extends LeafProduct>(product: T): LeafProductType<T> =>
    LeafProductType.create(product.type) as any,
};

export const createLeafProductUtils = <P extends LeafProduct, N extends string>(id: P["type"], name: N) => ({
  productType: LeafProductType.create(id) as LeafProductType<P>,
  ...({
    [`is${name}`]: (q: Product): q is P =>
      Product.isProduct(q, LeafProductType.create(id))
  } as Record<`is${N}`, (q: Product) => q is P>),
  convert<Q extends ConvertibleTo<P>>(q: Q): Promise<P>{
    return conversionRegistry.convertProduct<P, Q>(LeafProductType.create(id), q);
  }
});

export interface LeafProductType<T extends LeafProduct = LeafProduct> {
  readonly type: "LeafProductType",
  readonly id: T["type"],
}

export const LeafProductType = {
  create: (id: Id): LeafProductType => ({
    type: "LeafProductType",
    id,
  }),
  isLeafProductType: checkTypeProperty<LeafProductType>("LeafProductType"),
}
