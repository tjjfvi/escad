import { Messenger } from "../messages/mod.ts";

export type ServerTranspilerShape = {/**/};

export type TranspilerServerShape = {
  transpile(path: string, force: boolean): Promise<void>;
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