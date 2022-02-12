import { Messenger } from "../../messaging/mod.ts";

export type ServerTranspilerShape = {/**/};

export type TranspilerServerShape = {
  transpile(url: string, force?: boolean): Promise<void>;
  transpileAll(urls: string[], force?: boolean): Promise<void>;
};

export type ServerTranspilerEvents = {
  transpileFinish: [];
};

export type ServerTranspilerMessenger = Messenger<
  ServerTranspilerShape,
  TranspilerServerShape,
  ServerTranspilerEvents
>;
export type TranspilerServerMessenger = Messenger<
  TranspilerServerShape,
  ServerTranspilerShape,
  ServerTranspilerEvents
>;
