
import { ExportType } from "./ExportType.ts"
import { artifactManager, ArtifactManager } from "./ArtifactManager.ts"
import { Id } from "./Id.ts"
import { ArtifactStore } from "./ArtifactStore.ts"
import { Product, ProductType } from "./Product.ts"
import { conversionRegistry, ConversionRegistry } from "./ConversionRegistry.ts"
import { WrappedValue } from "./WrappedValue.ts"

export class ExportTypeRegistry {

  constructor(public artifactManager: ArtifactManager, public conversionRegistry: ConversionRegistry){
    this.artifactManager.artifactStores.push(this.artifactStore)
  }

  private registered = new Map<Id, ExportType<any>>()

  static readonly artifactStoreId = Id.create(import.meta.url, "@escad/core", "ArtifactStore", "ExportTypeRegistry")
  readonly artifactStore: ArtifactStore = {
    lookupRef: async ([id, exportTypeId, products], artifactManager) => {
      if(id !== ExportTypeRegistry.artifactStoreId) return null
      const exportType = this.registered.get(exportTypeId as Id)
      if(!exportType) return null
      if(!(products instanceof Array) || !products.every(Product.isProduct)) return null
      const convertedProducts = await Promise.all(products.map(p =>
        this.conversionRegistry.convertProduct(ProductType.fromProductTypeish(exportType.productType), p),
      ))
      const exported = await exportType.export(convertedProducts)
      await artifactManager.storeRef([id, exportTypeId, products], exported)
      return WrappedValue.create(exported)
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
