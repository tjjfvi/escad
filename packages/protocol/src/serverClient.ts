
import { Messenger } from "@escad/messages"
import { Hash, Log } from "@escad/core"
import { Info } from "./serverRenderer"

export type ServerClientShape = {
  lookupRef(loc: readonly unknown[]): Promise<Hash<unknown>>,
  run(params?: unknown): Promise<Info>,
}

export type ClientServerShape = {}

export type ServerClientEvents = {
  changeObserved: [],
  info: [info: Info],
  bundleStart: [],
  bundleFinish: [hash: Hash<unknown>],
  log: [log: Hash<Log> | null],
}

export type ServerClientMessenger = Messenger<ServerClientShape, ClientServerShape, ServerClientEvents>
export type ClientServerMessenger = Messenger<ClientServerShape, ServerClientShape, ServerClientEvents>
