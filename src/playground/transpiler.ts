import { createServer as _createServer } from "../server/mod.ts";
import {
  brandConnection,
  createMessenger,
  workerConnection,
} from "../messages/mod.ts";
import { ServerTranspilerMessenger } from "../protocol/mod.ts";

export const transpilerConnection = workerConnection(
  worker("./transpilerWorker.js"),
);

export const transpiler: ServerTranspilerMessenger = createMessenger({
  impl: {},
  connection: brandConnection(transpilerConnection, "a"),
});

function worker(relativePath: string) {
  let url = new URL(relativePath, import.meta.url).toString();
  return new Worker(url, { type: "module" });
}
