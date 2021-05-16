
import { ExportType } from "./ExportType"
import { artifactManager, ArtifactManager } from "./ArtifactManager"
import { Id } from "./Id"
import { ArtifactStore } from "./ArtifactStore"
import { Product, ProductType } from "./Product"
import { conversionRegistry, ConversionRegistry } from "./ConversionRegistry"
import { IdMap } from "./IdMap"

export class ExportTypeRegistry {

  constructor(public artifactManager: ArtifactManager, public conversionRegistry: ConversionRegistry){
    this.artifactManager.artifactStores.push(this.artifactStore)
  }

  private registered = new IdMap<ExportType<any>>()

  static readonly artifactStoreId = Id.create(__filename, "@escad/core", "ArtifactStore", "ExportTypeRegistry", "0")
  readonly artifactStore: ArtifactStore = {
    lookupRef: async ([id, exportTypeId, products], artifactManager) => {
      if(!Id.isId(id) || !Id.equal(id, ExportTypeRegistry.artifactStoreId)) return null
      if(!Id.isId(exportTypeId)) return null
      const exportType = this.registered.get(exportTypeId)
      if(!exportType) return null
      if(!(products instanceof Array) || !products.every(Product.isProduct)) return null
      const convertedProducts = await Promise.all(products.map(p =>
        this.conversionRegistry.convertProduct(ProductType.fromProductTypeish(exportType.productType), p),
      ))
      const exported = await exportType.export(convertedProducts)
      await artifactManager.storeRef([id, exportTypeId, products], exported)
      return exported
    },
  }

  register<T extends Product>(exportType: ExportType<T>){
    this.registered.set(exportType.id, exportType)
  }

  listRegistered(): Iterable<ExportType<any>>{
    return this.registered.values()
  }

}

export const exportTypeRegistry = new ExportTypeRegistry(artifactManager, conversionRegistry)
