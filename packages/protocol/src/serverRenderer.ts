
import { ExportTypeInfo, Hash, ProductType } from "@escad/core";
import { Messenger } from "@escad/messages";
import { PluginRegistration } from "@escad/register-client-plugin";

export interface RunInfo {
  hierarchy: Hash | null,
  products: Hash[],
  paramDef: Hash | null,
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
  lookupRef(loc: readonly unknown[]): Promise<Hash>,
}

export type ServerRendererMessengerShape = {
  getArtifactsDir(): Promise<string>,
}

export type ServerRendererMessenger = Messenger<ServerRendererMessengerShape, RendererServerMessengerShape>;
export type RendererServerMessenger = Messenger<RendererServerMessengerShape, ServerRendererMessengerShape>;