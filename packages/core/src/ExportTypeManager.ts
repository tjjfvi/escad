
import { ExportType } from "./ExportType";
import { ReadonlyArtifactManager } from "./ReadonlyArtifactManager";
import { LeafProduct, ProductType } from "./LeafProduct";
import { Readable } from "stream";

export class ExportTypeManager<P extends LeafProduct> extends ReadonlyArtifactManager<ExportType<P>> {

  private static managerMap = new Map<ProductType<any>, ExportTypeManager<any>>();

  subdir: string;

  constructor(public productType: ProductType<P>){
    super();
    this.subdir = "exportTypes/" + productType.id.sha.hex;
  }

  serialize(exportType: ExportType<any>){
    return Readable.from([Buffer.from(JSON.stringify({
      name: exportType.name,
      extension: exportType.extension,
    }))]);
  }

  static get<P extends LeafProduct>(productType: ProductType<P>): ExportTypeManager<P>{
    let manager = this.managerMap.get(productType) ?? new ExportTypeManager(productType);
    this.managerMap.set(productType, manager);
    return manager;
  }

}
