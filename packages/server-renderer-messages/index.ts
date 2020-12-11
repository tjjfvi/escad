
import { Hex } from "@escad/core";
import { PluginRegistration } from "@escad/register-client-plugin";

export type ServerRendererMessage =
  | ServerRendererMessage.ArtifactsDir
  | ServerRendererMessage.Load
  | ServerRendererMessage.Run
  | ServerRendererMessage.LookupRef

export namespace ServerRendererMessage {
  export interface ArtifactsDir {
    type: "artifactsDir",
    artifactsDir: string,
  }
  export interface Load {
    type: "load",
    path: string,
  }
  export interface Run {
    type: "run",
    id: string,
    params: unknown,
  }
  export interface LookupRef {
    type: "lookupRef",
    id: string,
    loc: unknown[],
  }
}

export type RendererServerMessage =
  | RendererServerMessage.Products
  | RendererServerMessage.ClientPlugins
  | RendererServerMessage.ParamDef
  | RendererServerMessage.RunResponse
  | RendererServerMessage.LookupRefResponse

export namespace RendererServerMessage {
  export interface Products {
    type: "products",
    products: Hex[],
  }
  export interface ClientPlugins {
    type: "clientPlugins",
    plugins: PluginRegistration[],
  }
  export interface ParamDef {
    type: "paramDef",
    paramDef: Hex | null,
  }
  export interface RunResponse {
    type: "runResponse",
    id: string,
    products: Hex[],
  }
  export interface LookupRefResponse {
    type: "lookupRefResponse",
    id: string,
    hash: Hex,
  }
}
