
import { Hex } from "@escad/core";

export type ServerClientMessage =
  | ServerClientMessage.Ping
  | ServerClientMessage.Init
  | ServerClientMessage.Products
  | ServerClientMessage.ParamDef
  | ServerClientMessage.LookupRawResponse
  | ServerClientMessage.LookupRefResponse

export namespace ServerClientMessage {
  export interface Ping {
    type: "ping",
  }
  export interface Init {
    type: "init",
    serverId: string,
    clientId: string,
  }
  export interface Products {
    type: "products",
    products: Hex[],
  }
  export interface ParamDef {
    type: "paramDef",
    paramDef: Hex | null,
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

export type ClientServerMessage =
  | ClientServerMessage.Init
  | ClientServerMessage.Params
  | ClientServerMessage.LookupRaw
  | ClientServerMessage.LookupRef

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
    hash: Hex,
  }
  export interface LookupRef {
    type: "lookupRef",
    id: string,
    loc: unknown[],
  }
}
