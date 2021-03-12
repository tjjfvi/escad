
import { Messenger } from "@escad/messages"
import { ExportTypeInfo, Hash, Hierarchy, ObjectParam, Product, ProductType } from "@escad/core"

export interface Info {
  products: Hash<Product>[],
  hierarchy: Hash<Hierarchy> | null,
  paramDef: Hash<ObjectParam<any>> | null,
  conversions?: [ProductType, ProductType][],
  exportTypes?: ExportTypeInfo[],
}

export type ServerClientMessengerShape = {
  ping(period: number): AsyncIterable<void>,
  info(): AsyncIterable<Info>,
  lookupRaw(hash: Hash<unknown>): Promise<string>,
  lookupRef(loc: readonly unknown[]): Promise<string>,
  onBundle(): AsyncIterable<Hash<unknown>>,
}

export type ClientServerMessengerShape = {
  params(): AsyncIterable<unknown>,
}

export type ServerClientMessenger = Messenger<ServerClientMessengerShape, ClientServerMessengerShape>;
export type ClientServerMessenger = Messenger<ClientServerMessengerShape, ServerClientMessengerShape>;
