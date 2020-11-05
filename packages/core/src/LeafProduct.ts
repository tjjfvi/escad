
import { Id } from "./Id";
import { ConvertibleTo } from "./Conversions";

export interface LeafProduct {
  readonly type: Id,
}

export const LeafProduct = {};

export const createProductTypeUtils = <P extends LeafProduct>(id: Id) => ({
  convert<Q extends ConvertibleTo<P>>(q: Q): P{
    return LeafProduct.ConversionRegistry.convertLeaf(id, q);
  }
});
