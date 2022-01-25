import { createServer as _createServer } from "../server/mod.ts";
import {
  brandConnection,
  serializeConnection,
  workerConnection,
} from "../messages/mod.ts";
import { instanceId } from "./instanceId.ts";
import { putVfs } from "./vfs.ts";
import { getRendererWorkerUrl } from "./renderer.ts";
import { transpiler, transpilerConnection } from "./transpiler.ts";

const rendererWorkerUrl = await getRendererWorkerUrl();

export const server = await _createServer({
  createRendererConnection: () =>
    serializeConnection(workerConnection(worker(rendererWorkerUrl))),
  transpilerConnection: brandConnection(transpilerConnection, "b"),
  coreClientUrl: new URL("/playground/client.tsx", import.meta.url)
    .toString(),
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
  // initialPump: false,
});

server.events.emit("changeObserved", transpiler.on("transpileFinish"));

function worker(relativePath: string) {
  let url = new URL(relativePath, import.meta.url).toString();
  return new Worker(url, { type: "module" });
}
