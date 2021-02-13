
import { Messenger } from "@escad/messages";
import { ExportTypeInfo, Hash, ProductType } from "@escad/core";

export interface Info {
  products: Hash[],
  hierarchy: Hash | null,
  paramDef: Hash | null,
  conversions?: [ProductType, ProductType][],
  exportTypes?: ExportTypeInfo[],
}

export type ServerClientMessengerShape = {
  ping(period: number): AsyncIterable<void>,
  info(): AsyncIterable<Info>,
  lookupRaw(hash: Hash): Promise<string>,
  lookupRef(loc: readonly unknown[]): Promise<string>,
  onBundle(): AsyncIterable<Hash>,
}

export type ClientServerMessengerShape = {
  params(): AsyncIterable<unknown>,
}

export type ServerClientMessenger = Messenger<ServerClientMessengerShape, ClientServerMessengerShape>;
export type ClientServerMessenger = Messenger<ClientServerMessengerShape, ServerClientMessengerShape>;
