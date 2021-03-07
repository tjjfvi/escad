
import { brandConnection, workerConnection } from "@escad/messages";
import { BundleOptions } from "@escad/protocol";
import { createRendererDispatcher, createServerBundlerMessenger } from "@escad/server";
import { createRendererWorker } from "./rendererWorker";
import fs from "fs";
import clientSource from "!!raw-loader!../workers/client.js";
import { createResourceFile } from "../utils/resourceFiles";
import BundlerWorker from "worker-loader?filename=bundler.worker.js!../workers/bundler.js";
import { attachWorkerFs } from "../utils/attachWorkerFs";
import { addLoadingStatus } from "./initialize";

const staticDir = "/static"
fs.mkdirSync(staticDir);

const baseBundleOptions: BundleOptions = {
  outDir: staticDir,
  coreClientPath: createResourceFile(clientSource),
  clientPlugins: [],
};

const bundlerWorker = new BundlerWorker();
attachWorkerFs(bundlerWorker);
export const bundlerMessenger = createServerBundlerMessenger(
  brandConnection(workerConnection(bundlerWorker), "bundler")
);

export const rendererMessenger = createRendererDispatcher(1, createRendererWorker);

(async function(){
  for await (const { clientPlugins } of rendererMessenger.req.onLoad())
    addLoadingStatus("Bundling client", () =>
      bundlerMessenger.req.bundle({
        ...baseBundleOptions,
        clientPlugins,
      })
    )
})()

export const reloadRenderer = () => {
  addLoadingStatus("Rendering", () =>
    rendererMessenger.req.load("/project/index")
  )
}
