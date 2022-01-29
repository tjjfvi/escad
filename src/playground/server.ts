import { createServer as _createServer } from "../server/mod.ts";
import {
  brandConnection,
  serializeConnection,
  workerConnection,
} from "../messages/mod.ts";
import { clientId } from "./swApi.ts";
import { put } from "./swApi.ts";
import { getRendererWorkerUrl } from "./renderer.ts";
import { transpiler, transpilerConnection } from "./transpiler.ts";
import { getTranspiledUrl } from "./getTranspiledUrl.ts";
import { escadLocation } from "./escadLocation.ts";
import "./code.ts";

const rendererWorkerUrl = await getRendererWorkerUrl();

export const server = await _createServer({
  createRendererConnection: () =>
    serializeConnection(workerConnection(worker(rendererWorkerUrl))),
  transpilerConnection: brandConnection(transpilerConnection, "b"),
  coreClientUrl: escadLocation + "/playground/client.tsx",
  writeClientRoot: async (content) => {
    await put(`${clientId}/client.js`, content);
  },
  mapClientPlugins: (url) => {
    if (url.startsWith(location.origin + "/transpiled/")) {
      return url.slice((location.origin + "/transpiled/").length);
    }
    return url;
  },
  getTranspiledUrl,
});

server.events.emit("changeObserved", transpiler.on("transpileFinish"));

function worker(relativePath: string) {
  let url = new URL(relativePath, import.meta.url).toString();
  return new Worker(url, { type: "module" });
}
