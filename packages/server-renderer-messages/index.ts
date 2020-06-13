import { Hex } from "@escad/core";

export type RequestId = string;

export type ServerRendererMessage =
  | ["artifactsDir", string]
  | ["load", string]
  | ["export", RequestId, Hex, Hex]
  | ["run", RequestId, Buffer]

export type RendererServerMessage =
  | ["shas", Hex[]]
  | ["exportFinish", RequestId]
  | ["clientPlugins", ClientPluginRegistration[]]
  | ["paramDef", Hex | null]
  | ["runFinish", RequestId, Hex[]]

export interface ClientPluginRegistration {
  path: string,
  idMap: [string, Hex][],
}
