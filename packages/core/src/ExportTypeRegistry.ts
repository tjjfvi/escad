
import { Id } from "./Id";
import { LeafProduct, ProductType } from "./LeafProduct";
import { ExportType } from "./ExportType"
import { ExportTypeManager } from "./ExportTypeManager";

export class ExportTypeRegistry {

  private mapMap = new Map<Id, Map<Id, ExportType<any>>>();

  register<P extends LeafProduct>(productType: ProductType<P>, exportType: ExportType<P>){
    let map = this.mapMap.get(productType.id) ?? new Map<Id, ExportType<any>>();
    this.mapMap.set(productType.id, map);
    map.set(exportType.id, exportType);
    ExportTypeManager.get(productType).store(exportType.id.sha, Promise.resolve(exportType));
  }

  getAll<P extends LeafProduct>(productType: ProductType<P>): ExportType<P>[]{
    let map = this.mapMap.get(productType.id);
    return map ? [...map.values()] : [];
  }

  get<P extends LeafProduct>(productType: ProductType<P>, exportId: Id): ExportType<P>{
    let map = this.mapMap.get(productType.id);
    if(!map)
      throw new Error(`Product type ${productType.id} has no exportTypes`);
    let exportType = map.get(exportId);
    if(!exportType)
      throw new Error(`Product type ${productType.id} has no exportType ${exportId}`);
    return exportType;
  }

}
