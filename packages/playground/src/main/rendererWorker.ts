
import { addLoadingStatus } from "./initialize";
import { createBlob } from "../utils/createBlob";
import { createServerRendererMessenger } from "@escad/server";
import fs from "fs";
import { brandConnection, createMessenger, workerConnection } from "@escad/messages";
import { ServerRendererMessenger } from "@escad/protocol";
import RendererBundlerWorker from "worker-loader?filename=bundler.worker.js!../workers/bundler.js";
import type { RendererBundlerMessengerShape } from "../workers/rendererBundler";
import { attachWorkerFs } from "../utils/attachWorkerFs";

const rendererBundlerWorker = new RendererBundlerWorker();
attachWorkerFs(rendererBundlerWorker);
const rendererBundlerMessenger = createMessenger<{/**/}, RendererBundlerMessengerShape>(
  {},
  brandConnection(workerConnection(rendererBundlerWorker), "rendererBundler")
);

let firstTime = true;
export const createRendererWorker = async (): Promise<ServerRendererMessenger> => {
  if(firstTime) {
    firstTime = false;
    return new Promise(() => {}); // Can't bundle atm, never resolves
  }
  return addLoadingStatus("Bundling renderer", async () => {
    await rendererBundlerMessenger.req.bundle();
    const worker = new Worker(createBlob(fs.readFileSync("/out/bundle.js"), "text/javascript"));
    attachWorkerFs(worker);
    return createServerRendererMessenger(
      brandConnection(workerConnection(worker), "renderer"),
      "/artifacts",
    );
  })
}
