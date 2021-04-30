
import { brandConnection, workerConnection } from "@escad/messages"
import { BundleOptions } from "@escad/protocol"
import { createServerBundlerMessenger } from "@escad/server"
import fs from "fs"
import clientSource from "!!raw-loader!../workers/client.js"
import { createResourceFile } from "../utils/resourceFiles"
import BundlerWorker from "worker-loader?filename=bundler.worker.js!../workers/bundler.js"
import { attachWorkerFs } from "../utils/attachWorkerFs"
import { createServerEmitter, ServerEmitter } from "@escad/server"
import { addLoadingStatus } from "./initialize"

const staticDir = "/static"
fs.mkdirSync(staticDir)

export const baseBundleOptions: BundleOptions = {
  outDir: staticDir,
  coreClientPath: createResourceFile(clientSource),
  clientPlugins: [],
}

const bundlerWorker = new BundlerWorker()
attachWorkerFs(bundlerWorker)
export const bundlerMessenger = createServerBundlerMessenger(
  brandConnection(workerConnection(bundlerWorker), "bundler"),
)

bundlerMessenger.bundle(baseBundleOptions)

export const serverEmitter: ServerEmitter = createServerEmitter()

serverEmitter.on("clientPlugins", clientPlugins => {
  addLoadingStatus("Bundling client", () =>
    bundlerMessenger.bundle({
      ...baseBundleOptions,
      clientPlugins,
    }),
  )
})

export const reloadRenderer = () => {
  serverEmitter.emit("reload")
}
