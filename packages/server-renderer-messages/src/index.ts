
import { Hash, ProductType } from "@escad/core";
import { PluginRegistration } from "@escad/register-client-plugin";

export type ServerRendererMessageTypes = ServerRendererMessage["type"]
export type ServerRendererMessage<T extends ServerRendererMessageTypes = any> = Extract<
  | ServerRendererMessage.ArtifactsDir
  | ServerRendererMessage.Load
  | ServerRendererMessage.Run
  | ServerRendererMessage.LookupRef
, { type: T }>

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
    loc: readonly unknown[],
  }
}

export type RendererServerMessageTypes = RendererServerMessage["type"]
export type RendererServerMessage<T extends ServerRendererMessageTypes = any> = Extract<
  | RendererServerMessage.Products
  | RendererServerMessage.RegisteredConversions
  | RendererServerMessage.ClientPlugins
  | RendererServerMessage.ParamDef
  | RendererServerMessage.RunResponse
  | RendererServerMessage.LookupRefResponse
, { type: T }>

export namespace RendererServerMessage {
  export interface Products {
    type: "products",
    products: Hash[],
  }
  export interface RegisteredConversions {
    type: "registeredConversions",
    conversions: [ProductType, ProductType][],
  }
  export interface ClientPlugins {
    type: "clientPlugins",
    plugins: PluginRegistration[],
  }
  export interface ParamDef {
    type: "paramDef",
    paramDef: Hash | null,
  }
  export interface RunResponse {
    type: "runResponse",
    id: string,
    products: Hash[],
  }
  export interface LookupRefResponse {
    type: "lookupRefResponse",
    id: string,
    hash: Hash,
  }
}