
import { ExportTypeInfo, Hash, Hierarchy, ObjectParam, Product, ProductType } from "@escad/core";
import { Messenger } from "@escad/messages";
import { PluginRegistration } from "@escad/register-client-plugin";

export interface RunInfo {
  hierarchy: Hash<Hierarchy> | null,
  products: Hash<Product>[],
  paramDef: Hash<ObjectParam<any>> | null,
}

export interface LoadInfo extends RunInfo {
  clientPlugins: PluginRegistration[],
  conversions: readonly (readonly [ProductType, ProductType])[],
  exportTypes: ExportTypeInfo[],
}

export type RendererServerMessengerShape = {
  onLoad(): AsyncIterable<LoadInfo>,
  load(path: string): Promise<LoadInfo>,
  run(params: unknown): Promise<RunInfo>,
  lookupRef(loc: readonly unknown[]): Promise<Hash<unknown>>,
}

export type ServerRendererMessengerShape = { /**/ }

export type ServerRendererMessenger = Messenger<ServerRendererMessengerShape, RendererServerMessengerShape>;
export type RendererServerMessenger = Messenger<RendererServerMessengerShape, ServerRendererMessengerShape>;
