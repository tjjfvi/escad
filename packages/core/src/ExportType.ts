import { Id } from "./Id";
import { Product, ProductType } from "./Product";

export interface ExportType<P extends Product> {
  readonly id: Id,
  readonly productType: ProductType<P>,
  readonly extension: "" | `.${string}`,
  readonly name: string,
  readonly export: (products: P[]) => Promise<Buffer>,
}

export type ExportTypeInfo = Omit<ExportType<any>, "export">;
