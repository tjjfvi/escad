
import { Hash } from "../core/mod.ts"
import { Connection, createMessenger } from "../messages/mod.ts"
import { ServerBundlerMessenger, ServerClientMessenger, ServerRendererShape } from "../protocol/mod.ts"
import { ServerRendererMessenger } from "../protocol/mod.ts"
import { ServerEmitter } from "./serverEmitter.ts"

export const createServerClientMessenger = ({
  connection,
  createRendererMessenger,
  bundlerMessenger,
  serverEmitter,
}: {
  connection: Connection<unknown>,
  createRendererMessenger: (lookupRaw: ServerRendererShape["lookupRaw"]) => Promise<ServerRendererMessenger>,
  bundlerMessenger?: ServerBundlerMessenger,
  serverEmitter: ServerEmitter,
}) => {
  let currentRendererProm: Promise<ServerRendererMessenger>
  reloadRenderer()
  const messenger: ServerClientMessenger = createMessenger({
    impl: {
      async lookupRef(loc){
        const renderer = await getRenderer()
        const hash = await renderer.lookupRef(loc)
        return hash
      },
      async run(params){
        reloadRenderer()
        const renderer = await getRenderer()
        const info = await renderer.run(params)
        serverEmitter.emit("clientPlugins", info.clientPlugins)
        messenger.emit("info", info)
        return info
      },
    },
    connection,
  })

  messenger.emit("changeObserved", serverEmitter.on("changeObserved"))
  if(bundlerMessenger) {
    messenger.emit("bundleStart", bundlerMessenger.on("bundleStart"))
    messenger.emit("bundleFinish", bundlerMessenger.on("bundleFinish"))
  }

  return messenger

  async function getRenderer(){
    console.log("Getting renderer")
    let lastRendererProm, renderer
    do renderer = await (lastRendererProm = currentRendererProm)
    while(lastRendererProm !== currentRendererProm) // Some time has passed, so there may be a new renderer
    return renderer
  }

  function reloadRenderer(){
    console.log("Reloading renderer")
    currentRendererProm?.then(r => r.destroy(true))
    currentRendererProm = createRendererMessenger(lookupRaw).then(renderer => {
      messenger.emit("log", renderer.on("log"))
      renderer.on("renderStart", () => console.log("Render started"))
      renderer.on("renderFinish", () => console.log("Render finished"))
      return renderer
    })
  }

  function lookupRaw(hash: Hash<unknown>){
    return messenger.lookupRaw(hash)
  }

}
