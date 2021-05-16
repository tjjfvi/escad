
import { ExportTypeInfo, Hash, Hierarchy, ObjectParam, Product, Log } from "@escad/core"
import { Messenger } from "@escad/messages"
import { PluginRegistration } from "@escad/register-client-plugin"

export interface Info {
  products: readonly Hash<Product>[],
  hierarchy: Hash<Hierarchy> | null,
  paramDef: Hash<ObjectParam<any>> | null,
  exportTypes: readonly ExportTypeInfo[],
  clientPlugins: readonly PluginRegistration[],
}

export type RendererServerShape = {
  run(params?: unknown): Promise<Info>,
  lookupRef(loc: readonly unknown[]): Promise<Hash<unknown>>,
}

export type ServerRendererEvents = {
  log: [log: Hash<Log> | null],
}

export type ServerRendererShape = {}

export type ServerRendererMessenger = Messenger<ServerRendererShape, RendererServerShape, ServerRendererEvents>
export type RendererServerMessenger = Messenger<RendererServerShape, ServerRendererShape, ServerRendererEvents>
