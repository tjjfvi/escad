
import {
  artifactManager,
  conversionRegistry,
  exportTypeRegistry,
  Product,
  Element,
  Hierarchy,
  contextStack,
  ObjectParam,
} from "@escad/core"
import { RunInfo, RendererServerMessenger, LoadInfo } from "@escad/protocol"
import { Connection, createEmittableAsyncIterable, createMessenger } from "@escad/messages"
import { registeredPlugins } from "@escad/register-client-plugin"
import { lookupRef } from "./lookupRef"
import { RenderFunction } from "./renderFunction"

export const createRendererServerMessenger = (
  connection: Connection<unknown>,
  requireFile: (path: string) => unknown = x => require(x),
) => {
  const [triggerLoad, onLoad] = createEmittableAsyncIterable<LoadInfo>()

  let run: (params: unknown) => Promise<RunInfo>

  const messenger: RendererServerMessenger = createMessenger({
    onLoad,
    load,
    lookupRef,
    run: params => run(params),
  }, connection)

  return messenger

  async function load(path: string){
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fullExported = requireFile(path)

    if(typeof fullExported !== "object" || !fullExported || !("default" in fullExported))
      throw new Error(`"${path}" has no default export`)

    const exported = fullExported["default" as never] as unknown

    if(typeof exported !== "function" && !(exported instanceof RenderFunction))
      throw new Error("Expected export type of function or RenderFunction")

    const [func, paramDef] = exported instanceof RenderFunction ? [exported.func, exported.paramDef] : [exported, null]
    const param = ObjectParam.create(paramDef ?? {})
    const { defaultValue: defaultParams } = param
    const paramHash = paramDef ? artifactManager.storeRaw(param) : null

    run = async params => {
      const { products, hierarchy } = await render(params)
      return {
        paramDef: await paramHash,
        products,
        hierarchy,
      }
    }

    const conversions = [...conversionRegistry.listAll()].map(x => [x.fromType, x.toType] as const)
    const { products, hierarchy } = await render(defaultParams)
    const exportTypes = [...exportTypeRegistry.listRegistered()].map(x => ({ ...x, export: undefined }))

    const loadInfo = {
      conversions,
      paramDef: await paramHash,
      clientPlugins: [...registeredPlugins],
      exportTypes,
      products,
      hierarchy,
    }

    triggerLoad(loadInfo)

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
      const products = await Promise.all(Element.toArrayFlat(el).map(p => artifactManager.storeRaw(p)))
      const hierarchy = await artifactManager.storeRaw(Hierarchy.from(el))
      return { products, hierarchy }
    }
  }

}
