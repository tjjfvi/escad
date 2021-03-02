
import { Messenger } from "@escad/messages"
import { Hash, Log } from "@escad/core"
import { Info } from "./serverRenderer"

export type ServerClientShape = {
  lookupRaw(hash: Hash<unknown>): Promise<string>,
  lookupRef(loc: readonly unknown[]): Promise<string>,
  run(params?: unknown): Promise<Info>,
}

export type ClientServerShape = {}

export type ServerClientEvents = {
  reload: [],
  info: [info: Info],
  bundleStart: [],
  bundleFinish: [hash: Hash<unknown>],
  log: [log: Hash<Log> | null],
}

export type ServerClientMessenger = Messenger<ServerClientShape, ClientServerShape, ServerClientEvents>
export type ClientServerMessenger = Messenger<ClientServerShape, ServerClientShape, ServerClientEvents>
