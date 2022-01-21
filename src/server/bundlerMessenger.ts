import { Connection, createMessenger } from "../messages/mod.ts";
import { ServerBundlerMessenger } from "../protocol/mod.ts";

export const createServerBundlerMessenger = (
  connection: Connection<unknown>,
): ServerBundlerMessenger => createMessenger({ impl: {}, connection });
