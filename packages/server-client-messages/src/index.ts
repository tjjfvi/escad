
import { ExportTypeInfo, Hash, ProductType } from "@escad/core";

export type ServerClientMessageTypes = ServerClientMessage["type"];
export type ServerClientMessage<T extends ServerClientMessageTypes = any> = Extract<
  | ServerClientMessage.Ping
  | ServerClientMessage.Init
  | ServerClientMessage.Info
  | ServerClientMessage.LookupRawResponse
  | ServerClientMessage.LookupRefResponse
, { type: T }>

export namespace ServerClientMessage {
  export interface Ping {
    type: "ping",
  }
  export interface Init {
    type: "init",
    serverId: string,
    clientId: string,
  }
  export interface Info {
    type: "info",
    products: Hash[],
    paramDef: Hash | null,
    conversions?: [ProductType, ProductType][],
    exportTypes?: ExportTypeInfo[],
    hierarchy: Hash | null,
  }
  export interface LookupRawResponse {
    type: "lookupRawResponse",
    id: string,
    url: string,
  }
  export interface LookupRefResponse {
    type: "lookupRefResponse",
    id: string,
    url: string,
  }
}

export type ClientServerMessageTypes = ClientServerMessage["type"];
export type ClientServerMessage<T extends ClientServerMessageTypes = any> = Extract<
  | ClientServerMessage.Init
  | ClientServerMessage.Params
  | ClientServerMessage.LookupRaw
  | ClientServerMessage.LookupRef
, { type: T }>

export namespace ClientServerMessage {
  export interface Init {
    type: "init",
    serverId: string | null,
    clientId: string | null,
  }
  export interface Params {
    type: "params",
    params: unknown,
  }
  export interface LookupRaw {
    type: "lookupRaw",
    id: string,
    hash: Hash,
  }
  export interface LookupRef {
    type: "lookupRef",
    id: string,
    loc: readonly unknown[],
  }
}
