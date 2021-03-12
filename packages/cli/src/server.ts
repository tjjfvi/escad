
import express from "express"
import expressWs from "express-ws"
import {
  createRendererDispatcher,
  createServerBundlerMessenger,
  createServerClientMessenger,
  createServerRendererMessenger,
} from "@escad/server"
import path from "path"
import { childProcessConnection, filterConnection, mapConnection } from "@escad/messages"
import { fork } from "child_process"
import watch from "node-watch"
import { BundleOptions } from "../../client/node_modules/@escad/protocol/src"

export interface ServerOptions {
  artifactsDir: string,
  port: number,
  loadFile: string,
  loadDir: string,
  dev: boolean,
}

export const createServer = async ({ artifactsDir, port, loadFile, loadDir, dev }: ServerOptions) => {
  const { app } = expressWs(express())

  const staticDir = path.join(__dirname, "../static/")
  const bundleDir = path.join(artifactsDir, "static/")

  app.use(express.static(staticDir))
  app.use(express.static(bundleDir))
  app.use("/artifacts", express.static(artifactsDir + "/"))

  const baseBundleOptions: BundleOptions = {
    outDir: bundleDir,
    coreClientPath: require.resolve("./client"),
    clientPlugins: [],
    watch: dev,
  }

  const bundlerProcess = fork(require.resolve("./bundler"), {
    env: { ...process.env, DEV_MODE: dev + "" },
  })
  const bundlerMessenger = createServerBundlerMessenger(childProcessConnection(bundlerProcess))

  bundlerMessenger.req.bundle(baseBundleOptions)

  const rendererMessenger = createRendererDispatcher(3, () => {
    const child = fork(require.resolve("./renderer"), {
      env: { ...process.env, ARTIFACTS_DIR: artifactsDir },
    })
    return createServerRendererMessenger(childProcessConnection(child))
  })

  rendererMessenger.req.load(loadFile)
  watch(loadDir, {
    filter: file => !file.includes("artifacts") && !file.includes("node_modules") && !file.includes("dist"),
  }, () => {
    rendererMessenger.req.load(loadFile)
  });

  (async function(){
    for await (const hash of bundlerMessenger.req.onBundle())
      console.log(`Bundled client (${hash.slice(0, 32)}...)`)
  })();

  (async function(){
    for await (const { clientPlugins } of rendererMessenger.req.onLoad())
      bundlerMessenger.req.bundle({
        ...baseBundleOptions,
        clientPlugins,
      })
  })()

  app.ws("/ws", ws => {
    const messenger = createServerClientMessenger(
      mapConnection.flatted(filterConnection.string({
        send: msg => ws.send(msg),
        onMsg: cb => ws.on("message", cb),
        offMsg: cb => ws.off("message", cb),
      })),
      hash => `/artifacts/raw/${hash}`,
      rendererMessenger,
      bundlerMessenger,
    )
    ws.on("close", () => messenger.destroy())
    ws.on("error", () => messenger.destroy())
  })

  const httpServer = app.listen(port, () => {
    const address = httpServer.address()
    const addressString =
    typeof address === "object" && address
      ? address.family === "IPv6"
        ? `[${address.address}]`
        : address.address
      : "<?>"
    const addressPortString = (
      typeof address === "object"
        ? address
          ? `http://${addressString}:${address.port}`
          : "<?>"
        : address
    )
    console.log(`Listening on ${addressPortString}`)
  })
}
