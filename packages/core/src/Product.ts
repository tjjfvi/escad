
import { LeafProduct, LeafProductType } from "./LeafProduct"
import { TupleProduct, TupleProductType } from "./TupleProduct"
import { ArrayProduct, ArrayProductType } from "./ArrayProduct";
import {
  __convertibleTo,
  __convertibleToOverride,
  _ConvertibleTo,
  __convertibleToTransitivityOverride,
  TransitivityOverride,
} from "./Conversions";
import { hash } from "./hash";

export interface _Product {
  readonly [__convertibleToTransitivityOverride]?: TransitivityOverride.A,
  readonly [__convertibleTo]?: (
    __convertibleToOverride extends keyof this
      ? unknown
      : LeafProduct extends this
        ? unknown
        : TupleProduct extends this
          ? unknown
          : ArrayProduct extends this
            ? unknown
            : _ConvertibleTo<this>
  ),
}

export type Product = LeafProduct | TupleProduct | ArrayProduct;

export const Product = {
  isProduct,
  getProductType: <P extends Product>(product: P): ProductType<P> => {
    if(LeafProduct.isLeafProduct(product))
      return LeafProduct.getLeafProductType(product)
    if(TupleProduct.isTupleProduct(product))
      return TupleProduct.getTupleProductType(product);
    if(ArrayProduct.isArrayProduct(product))
      return ArrayProduct.getArrayProductType(product);
    throw new Error("Invalid product passed to Product.getProductType");
  }
}

function isProduct(arg: any): arg is Product
function isProduct<P extends Product>(arg: any, productType: ProductType<P>): arg is P
function isProduct(arg: any, productType: ProductType | null = null){
  return (
    (LeafProduct.isLeafProduct(arg) || TupleProduct.isTupleProduct(arg) || ArrayProduct.isArrayProduct(arg)) &&
    (!productType || hash(Product.getProductType(arg)) === hash(productType))
  );
}

export type ProductType<U extends Product = Product> =
  | LeafProductType<Extract<U, LeafProduct>>
  | TupleProductType<Extract<U, TupleProduct>>
  | ArrayProductType<Extract<U, ArrayProduct>>

// Extract<
//   Product extends U ?
//     _ProductType :
//     U extends LeafProduct ?
//       LeafProductType<U> :
//         TupleProductType<Extract<U, TupleProduct<any>>>
// , _ProductType>
