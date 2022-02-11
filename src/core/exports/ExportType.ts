import { ScopedId } from "../utils/mod.ts";
import { Product, ProductTypeish } from "../product/mod.ts";

export interface ExportType<P extends Product> {
  readonly id: ScopedId<"ExportType">;
  readonly productType: ProductTypeish<P>;
  readonly extension: "" | `.${string}`;
  readonly name: string;
  readonly export: (products: P[]) => Promise<ArrayBuffer>;
}

export type ExportTypeInfo = Omit<ExportType<any>, "export">;
