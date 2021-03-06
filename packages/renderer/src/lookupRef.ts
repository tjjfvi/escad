
import { Hash, artifactManager, Id, ConversionRegistry, ExportTypeRegistry, Product } from "@escad/core"

export async function lookupRef(loc: readonly unknown[]){
  const type = getRefType(loc)
  const timerName = type ? `${type} ${Hash.create(loc).slice(0, 16)}...` : undefined
  if(type) console.time(timerName)
  const artifact = await artifactManager.lookupRef(loc)
  const artifactHash = await artifactManager.storeRaw(artifact)
  if(type) console.timeEnd(timerName)
  return artifactHash
}

function getRefType(loc: readonly unknown[]): string | undefined{
  if(Id.isId(loc[0]) && Id.equal(loc[0], ConversionRegistry.artifactStoreId))
    return Product.isProduct(loc[1]) ? "Convert" : "Compose"
  if(Id.isId(loc[0]) && Id.equal(loc[0], ExportTypeRegistry.artifactStoreId))
    return "Export"
}
