
import { addLoadingStatus } from "./initialize";
import { createBlob } from "../utils/createBlob";
import { createServerRendererMessenger } from "@escad/server";
import fs from "fs";
import { brandConnection, createMessenger, workerConnection } from "@escad/messages";
import { ServerRendererMessenger } from "@escad/protocol";
import RendererBundlerWorker from "worker-loader?filename=bundler.worker.js!../workers/bundler.js";
import type { RendererBundlerMessengerShape } from "../workers/rendererBundler";
import { attachWorkerFs } from "../utils/attachWorkerFs";
import { InMemoryArtifactStore } from "../utils/InMemoryArtifactStore";
import { ArtifactStore } from "@escad/core";

export const artifactStore = new InMemoryArtifactStore();

const rendererBundlerWorker = new RendererBundlerWorker();
attachWorkerFs(rendererBundlerWorker);
const rendererBundlerMessenger = createMessenger<{/**/}, RendererBundlerMessengerShape>(
  {},
  brandConnection(workerConnection(rendererBundlerWorker), "rendererBundler"),
);

let firstTime = true;
export const createRendererWorker = async (): Promise<ServerRendererMessenger> => {
  if(firstTime) {
    firstTime = false;
    return new Promise(() => {}); // Can't bundle atm, never resolves
  }
  return addLoadingStatus("Bundling renderer", async () => {
    await rendererBundlerMessenger.req.bundle();
    const bundleUrl = createBlob(fs.readFileSync("/out/bundle.js"), "text/javascript");
    const rendererUrl = createBlob(
      Buffer.from(`importScripts("${location.origin}/bundled/escad.js","${bundleUrl}")`),
      "test/javascript",
    );
    const worker = new Worker(rendererUrl);
    const artifactMessenger = createMessenger<Required<ArtifactStore>, {/**/}>(
      artifactStore,
      brandConnection(workerConnection(worker), "artifacts"),
    );
    return createServerRendererMessenger(
      {
        ...brandConnection(workerConnection(worker), "renderer"),
        destroy: () => artifactMessenger.destroy(),
      },
    );
  })
}
