import { ScopedId } from "./Id.ts"
import { Product, ProductTypeish } from "./Product.ts"

export interface ExportType<P extends Product> {
  readonly id: ScopedId<"ExportType">,
  readonly productType: ProductTypeish<P>,
  readonly extension: "" | `.${string}`,
  readonly name: string,
  readonly export: (products: P[]) => Promise<Buffer>,
}

export type ExportTypeInfo = Omit<ExportType<any>, "export">
