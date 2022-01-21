import { addLoadingStatus } from "./initialize.ts";
import { createBlob } from "../utils/createBlob.ts";
import { createServerRendererMessenger } from "../server/mod.ts";
import fs from "fs.ts";
import {
  brandConnection,
  createMessenger,
  workerConnection,
} from "../messages/mod.ts";
import {
  ServerRendererMessenger,
  ServerRendererShape,
} from "../protocol/mod.ts";
import RendererBundlerWorker from "worker-loader?filename=bundler.worker.js!../workers/bundler.js.ts";
import type { RendererBundlerMessengerShape } from "../workers/rendererBundler.ts";
import { attachWorkerFs } from "../utils/attachWorkerFs.ts";
import { InMemoryArtifactStore } from "../core/mod.ts";
import { ArtifactStore } from "../core/mod.ts";

export const artifactStore = new InMemoryArtifactStore();

const rendererBundlerWorker = new RendererBundlerWorker();
attachWorkerFs(rendererBundlerWorker);
const rendererBundlerMessenger = createMessenger<
  {},
  RendererBundlerMessengerShape,
  {}
>({
  impl: {},
  connection: brandConnection(
    workerConnection(rendererBundlerWorker),
    "rendererBundler",
  ),
});

let firstTime = true;
export const createRendererWorker = async (
  lookupRaw: ServerRendererShape["lookupRaw"],
): Promise<ServerRendererMessenger> => {
  if (firstTime) {
    firstTime = false;
    return new Promise(() => {}); // Can't bundle atm, never resolves
  }
  return addLoadingStatus("Bundling renderer", async () => {
    await rendererBundlerMessenger.bundle();
    const bundleUrl = createBlob(
      fs.readFileSync("/out/bundle.js"),
      "text/javascript",
    );
    const rendererUrl = createBlob(
      Buffer.from(
        `importScripts("${location.origin}/bundled/escad.js","${bundleUrl}")`,
      ),
      "test/javascript",
    );
    const worker = new Worker(rendererUrl);
    const artifactMessenger = createMessenger<Required<ArtifactStore>, {}, {}>({
      impl: artifactStore,
      connection: brandConnection(workerConnection(worker), "artifacts"),
    });
    return createServerRendererMessenger(
      lookupRaw,
      {
        ...brandConnection(workerConnection(worker), "renderer"),
        destroy: () => artifactMessenger.destroy(),
      },
    );
  });
};
