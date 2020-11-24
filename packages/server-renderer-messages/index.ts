
import { Hex, ProductType } from "@escad/core";
import { PluginRegistration } from "@escad/register-client-plugin";

export type RequestId = string;

export type ServerRendererMessage =
  | ServerRendererMessage.ArtifactsDir
  | ServerRendererMessage.Load
  | ServerRendererMessage.Export
  | ServerRendererMessage.Run
  | ServerRendererMessage.Convert

export namespace ServerRendererMessage {
  export type ArtifactsDir = ["artifactsDir", string];
  export type Load = ["load", string]
  export type Export = ["export", RequestId, Hex, Hex]
  export type Run = ["run", RequestId, unknown]
  export type Convert = ["convert", RequestId, Hex, ProductType];
}

export type RendererServerMessage =
  | RendererServerMessage.Shas
  | RendererServerMessage.ExportFinish
  | RendererServerMessage.ClientPlugins
  | RendererServerMessage.ParamDef
  | RendererServerMessage.RunFinish
  | RendererServerMessage.ConvertFinish

export namespace RendererServerMessage {
  export type Shas = ["shas", Hex[]];
  export type ExportFinish = ["exportFinish", RequestId];
  export type ClientPlugins = ["clientPlugins", PluginRegistration[]];
  export type ParamDef = ["paramDef", Hex | null];
  export type RunFinish = ["runFinish", RequestId, Hex[]];
  export type ConvertFinish = ["convertFinish", RequestId, Hex];
}
