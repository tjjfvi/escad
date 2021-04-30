
import { Messenger } from "@escad/messages"
import { Hash } from "@escad/core"
import { Info } from "./serverRenderer"

export type ServerClientShape = {
  lookupRaw(hash: Hash<unknown>): Promise<string>,
  lookupRef(loc: readonly unknown[]): Promise<string>,
  run(params?: unknown): Promise<Info>,
}

export type ClientServerShape = {}

export type ServerClientEvents = {
  ping: [],
  reload: [],
  info: [info: Info],
  bundle: [hash: Hash<unknown>],
}

export type ServerClientMessenger = Messenger<ServerClientShape, ClientServerShape, ServerClientEvents>
export type ClientServerMessenger = Messenger<ClientServerShape, ServerClientShape, ServerClientEvents>
