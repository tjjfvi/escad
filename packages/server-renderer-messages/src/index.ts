
import { Hash, ProductType } from "@escad/core";
import { PluginRegistration } from "@escad/register-client-plugin";

export interface RunInfo {
  hierarchy: Hash | null,
  products: Hash[],
  paramDef: Hash | null,
}

export interface LoadInfo extends RunInfo {
  clientPlugins: PluginRegistration[],
  conversions: [ProductType, ProductType][],
}

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
  | RendererServerMessage.LoadResponse
  | RendererServerMessage.RunResponse
  | RendererServerMessage.LookupRefResponse
, { type: T }>

export namespace RendererServerMessage {
  export interface RunResponse extends RunInfo {
    type: "runResponse",
    id: string,
  }
  export interface LoadResponse extends LoadInfo {
    type: "loadResponse",
  }
  export interface LookupRefResponse {
    type: "lookupRefResponse",
    id: string,
    hash: Hash,
  }
}
