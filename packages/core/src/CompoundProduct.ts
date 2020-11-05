
import { LeafProduct, LeafProductType } from "./LeafProduct";
import { Product, _ProductType, _Product } from "./Product";

export type CompoundProductType<T extends CompoundProduct<readonly Product[]>> =
  {
    readonly [K in keyof T["children"]]:
      T["children"][K] extends infer U ? U extends Product ? (
        // Inlined from ProductType because otherwise it was 2589ing for some reason
        Product extends U ?
          _ProductType :
          U extends LeafProduct ?
            LeafProductType<U> :
              CompoundProductType<Extract<U, CompoundProduct<any>>>
       ) : U : never;
  }

export interface CompoundProduct<T extends readonly Product[]> extends _Product {
  readonly isCompoundProduct: true,
  readonly children: T,
}

export const CompoundProduct = {
  isCompoundProduct: (arg: any): arg is CompoundProduct<readonly Product[]> =>
    typeof arg === "object" && arg.isCompoundProduct === true
};
