import { Messenger } from "../messages/mod.ts";
import { Hash, Log } from "../core/mod.ts";
import { RenderInfo } from "./serverRenderer.ts";

export type ServerClientShape = {
  lookupRef(loc: readonly Hash<unknown>[]): Promise<Hash<unknown>>;
  run(params?: unknown): Promise<RenderInfo>;
};

export type ClientServerShape = {
  lookupRaw(hash: Hash<unknown>): Promise<readonly Uint8Array[] | null>;
};

export type ServerClientEvents = {
  changeObserved: [];
  info: [info: RenderInfo];
  reload: [];
  log: [log: Hash<Log> | null];
};

export type ServerClientMessenger = Messenger<
  ServerClientShape,
  ClientServerShape,
  ServerClientEvents
>;
export type ClientServerMessenger = Messenger<
  ClientServerShape,
  ServerClientShape,
  ServerClientEvents
>;
