
import { LeafProduct, LeafProductType } from "./LeafProduct";
import { Product, _ProductType, _Product, ProductType } from "./Product";

export type CompoundProductType<T extends CompoundProduct<readonly Product[]>> =
  {
    readonly [K in Exclude<keyof T["children"], keyof any[]>]:
      T["children"][K] extends infer U ? U extends Product ? (
        ProductType<U>
        // Inlined from ProductType because otherwise it was 2589ing for some reason
        // Product extends U ?
        //   _ProductType :
        //   U extends LeafProduct ?
        //     LeafProductType<U> :
        //       CompoundProductType<Extract<U, CompoundProduct<any>>>
       ) : never : never
  }

export interface CompoundProduct<T extends readonly Product[]> extends _Product {
  readonly isCompoundProduct: true,
  readonly children: T,
}

export const CompoundProduct = Object.assign(
  <T extends readonly Product[]>(children: T): CompoundProduct<T> => ({
    children,
    isCompoundProduct: true,
  }), {
    isCompoundProduct: (arg: unknown): arg is CompoundProduct<readonly Product[]> =>
      typeof arg === "object" &&
    arg !== null &&
    "isCompoundProduct" in arg &&
    arg["isCompoundProduct" as keyof typeof arg] === true
  }
)
