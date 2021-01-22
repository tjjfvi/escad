
import { LeafProduct, LeafProductType } from "./LeafProduct"
import { TupleProduct, TupleProductType } from "./TupleProduct"
import { Id } from "./Id";
import {
  __convertibleTo,
  __convertibleToOverride,
  _ConvertibleTo,
} from "./Conversions";
import { hash } from "./hash";

export interface _Product {
  readonly [__convertibleTo]?: (
    __convertibleToOverride extends keyof this
      ? unknown
      : LeafProduct extends this
        ? unknown
        : TupleProduct<readonly Product[]> extends this
          ? unknown
          : _ConvertibleTo<this>
  ),
}

export type Product = LeafProduct | TupleProduct<readonly Product[]>;

export type _ProductType = Id | { readonly [k: number]: _ProductType };

export type ProductType<U extends Product = Product> = Extract<
  Product extends U ?
    _ProductType :
    U extends LeafProduct ?
      LeafProductType<U> :
        TupleProductType<Extract<U, TupleProduct<any>>>
, _ProductType>

export const Product = {
  isProduct,
}

function isProduct(arg: any): arg is Product
function isProduct<P extends Product>(arg: any, productType: ProductType<P>): arg is P
function isProduct(arg: any, productType: ProductType | null = null){
  return (
    (LeafProduct.isLeafProduct(arg) || TupleProduct.isTupleProduct(arg)) &&
    (!productType || hash(getProductType(arg)) === hash(productType))
  );
}

export const getProductType = <P extends Product>(product: P): ProductType<P> => {
  if(LeafProduct.isLeafProduct(product))
    return product.type as any;
  if(TupleProduct.isTupleProduct(product))
    return product.children.map(getProductType) as any;
  throw new Error("Invalid product passed to getProductType");
}
