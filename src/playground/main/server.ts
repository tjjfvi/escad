import { brandConnection, workerConnection } from "../messages/mod.ts";
import { BundleOptions } from "../protocol/mod.ts";
import { createServerBundlerMessenger } from "../server/mod.ts";
import fs from "fs.ts";
import clientSource from "!!raw-loader!../workers/client.js.ts";
import { createResourceFile } from "../utils/resourceFiles.ts";
import BundlerWorker from "worker-loader?filename=bundler.worker.js!../workers/bundler.js.ts";
import { attachWorkerFs } from "../utils/attachWorkerFs.ts";
import { createServerEmitter, ServerEmitter } from "../server/mod.ts";
import { addLoadingStatus } from "./initialize.ts";

const staticDir = "/static";
fs.mkdirSync(staticDir);

export const baseBundleOptions: BundleOptions = {
  outDir: staticDir,
  coreClientPath: createResourceFile(clientSource),
  clientPlugins: [],
};

const bundlerWorker = new BundlerWorker();
attachWorkerFs(bundlerWorker);
export const bundlerMessenger = createServerBundlerMessenger(
  brandConnection(workerConnection(bundlerWorker), "bundler"),
);

bundlerMessenger.bundle(baseBundleOptions);

export const serverEmitter: ServerEmitter = createServerEmitter();

serverEmitter.on("clientPlugins", (clientPlugins) => {
  addLoadingStatus("Bundling client", () =>
    bundlerMessenger.bundle({
      ...baseBundleOptions,
      clientPlugins,
    }));
});

export const reloadRenderer = () => {
  serverEmitter.emit("changeObserved");
};
