
import { Hex } from "@escad/core";

export type ServerClientMessage =
  | ServerClientMessage.Ping
  | ServerClientMessage.Init
  | ServerClientMessage.Shas
  | ServerClientMessage.ParamDef

export namespace ServerClientMessage {
  export type Ping = [];
  export type Init = ["init", string, string];
  export type Shas = ["shas", Hex[]];
  export type ParamDef = ["paramDef", Hex | null];
}

export type ClientServerMessage =
  | ClientServerMessage.Init
  | ClientServerMessage.Params

export namespace ClientServerMessage {
  export type Init = ["init", string | null, string | null];
  export type Params = ["params", unknown];
}
