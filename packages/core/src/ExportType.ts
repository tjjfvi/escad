import { ScopedId } from "./Id"
import { Product, ProductType } from "./Product"

export interface ExportType<P extends Product> {
  readonly id: ScopedId<"ExportType">,
  readonly productType: ProductType<P>,
  readonly extension: "" | `.${string}`,
  readonly name: string,
  readonly export: (products: P[]) => Promise<Buffer>,
}

export type ExportTypeInfo = Omit<ExportType<any>, "export">
