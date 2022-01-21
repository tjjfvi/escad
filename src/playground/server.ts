import { createServer as _createServer } from "../server/mod.ts";
import {
  brandConnection,
  createMessenger,
  serializeConnection,
  workerConnection,
} from "../messages/mod.ts";
import { instanceId } from "./instanceId.ts";
import { putVfs } from "./vfs.ts";
import { getRendererWorkerUrl } from "./renderer.ts";
import { ServerTranspilerMessenger } from "../protocol/mod.ts";

const transpilerConnection = workerConnection(worker("./transpilerWorker.js"));

export const transpiler: ServerTranspilerMessenger = createMessenger({
  impl: {},
  connection: brandConnection(transpilerConnection, "a"),
});

const rendererWorkerUrl = await getRendererWorkerUrl();

export const server = _createServer({
  createRendererConnection: () =>
    serializeConnection(workerConnection(worker(rendererWorkerUrl))),
  transpilerConnection: brandConnection(transpilerConnection, "b"),
  coreClientUrl: new URL("/playground/client.tsx", import.meta.url).toString(),
  writeClientRoot: async (content) => {
    console.log("clientroot");
    await putVfs(`${instanceId}/client.js`, content);
  },
  mapClientPlugins: (url) => {
    if (url.startsWith(location.origin + "/vfs/")) {
      return url.slice((location.origin + "/vfs/").length);
    }
    return url;
  },
  getTranspiledUrl: (url) => "/vfs/" + url,
  initialPump: false,
});

server.then((server) => {
  server.events.emit("changeObserved", transpiler.on("transpileFinish"));
});

function worker(relativePath: string) {
  let url = new URL(relativePath, import.meta.url).toString();
  return new Worker(url, { type: "module" });
}
