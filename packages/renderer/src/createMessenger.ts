
import {
  artifactManager,
  conversionRegistry,
  exportTypeRegistry,
  Product,
  Element,
  Hierarchy,
  contextStack,
  ObjectParam,
  ProductType,
} from "@escad/core"
import { Info, RendererServerMessenger } from "@escad/protocol"
import { Connection, createMessenger } from "@escad/messages"
import { registeredPlugins } from "@escad/register-client-plugin"
import { lookupRef } from "./lookupRef"
import { RenderFunction } from "./renderFunction"

export const createRendererServerMessenger = (
  connection: Connection<unknown>,
  requireFile: () => unknown,
) => {
  const messenger: RendererServerMessenger = createMessenger({
    impl: {
      run,
      lookupRef,
    },
    connection,
  })

  return messenger

  async function run(params?: unknown){
    const fullExported = requireFile()

    if(typeof fullExported !== "object" || !fullExported || !("default" in fullExported))
      throw new Error("File has no default export")

    const exported = fullExported["default" as never] as unknown

    if(typeof exported !== "function" && !(exported instanceof RenderFunction))
      throw new Error("Expected export type of function or RenderFunction")

    const [func, paramDef] = exported instanceof RenderFunction ? [exported.func, exported.paramDef] : [exported, null]
    const param = ObjectParam.create(paramDef ?? {})
    const { defaultValue: defaultParams } = param
    const paramHash = paramDef ? artifactManager.storeRaw(param) : null

    const conversions = [...conversionRegistry.listAll()].map(x => [x.fromType, x.toType] as const)
    const { products, hierarchy } = await render(params ?? defaultParams)
    const exportTypes = [...exportTypeRegistry.listRegistered()].map(x => ({
      ...x,
      export: undefined,
      productType: ProductType.fromProductTypeish(x.productType),
    }))

    const loadInfo: Info = {
      conversions,
      paramDef: await paramHash,
      clientPlugins: [...registeredPlugins],
      exportTypes,
      products,
      hierarchy,
    }

    return loadInfo

    async function render(params: unknown){
      let result
      try {
        result = await contextStack.wrap(() => func(params as never))
      }
      catch (e) {
        console.error(e)
        return { products: [], hierarchy: null }
      }
      if(!result) {
        console.error(new Error("Invalid return type from exported function"))
        return { products: [], hierarchy: null }
      }
      const el = Element.create<Product>(result)
      const products = await Promise.all((await Element.toArrayFlat(el)).map(p => artifactManager.storeRaw(p)))
      const hierarchy = await artifactManager.storeRaw(await Hierarchy.from(el))
      return { products, hierarchy }
    }
  }

}
