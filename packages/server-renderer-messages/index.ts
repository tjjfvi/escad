import { Hex } from "@escad/core";

export type RequestId = string;

export type ServerRendererMessage =
  | ["artifactsDir", string]
  | ["load", string]
  | ["export", RequestId, Hex, Hex]

export type RendererServerMessage =
  | ["shas", Hex[]]
  | ["exportFinish", RequestId]
  | ["clientPlugins", ClientPluginRegistration[]]

export interface ClientPluginRegistration {
  path: string,
  productIdMap: [string, Hex][],
}
