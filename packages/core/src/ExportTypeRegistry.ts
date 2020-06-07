
import { Id } from "./Id";
import { Product, ProductType } from "./Product";
import { ExportType } from "./ExportType"
import { ExportTypeManager } from "./ExportTypeManager";

export class ExportTypeRegistry {

  private mapMap = new Map<Id, Map<Id, ExportType<any>>>();

  register<P extends Product<P>>(productType: ProductType<P>, exportType: ExportType<P>){
    let map = this.mapMap.get(productType.id) ?? new Map<Id, ExportType<any>>();
    this.mapMap.set(productType.id, map);
    map.set(exportType.id, exportType);
    ExportTypeManager.get(productType).store(exportType.id.sha, Promise.resolve(exportType));
  }

  getAll<P extends Product<P>>(productType: ProductType<P>): ExportType<P>[]{
    let map = this.mapMap.get(productType.id);
    return map ? [...map.values()] : [];
  }

  get<P extends Product<P>>(productType: ProductType<P>, exportId: Id): ExportType<P>{
    let map = this.mapMap.get(productType.id);
    if(!map)
      throw new Error(`Product type ${productType.id} has no exportTypes`);
    let exportType = map.get(exportId);
    if(!exportType)
      throw new Error(`Product type ${productType.id} has no exportType ${exportId}`);
    return exportType;
  }

}
