
import { Hash } from "@escad/core"
import { Connection, createMessenger } from "@escad/messages"
import { ServerBundlerMessenger, ServerClientMessenger } from "@escad/protocol"
import { ServerRendererMessenger } from "@escad/protocol"
import { ServerEmitter } from "./serverEmitter"

export const createServerClientMessenger = ({
  connection,
  hashToUrl,
  createRendererMessenger,
  bundlerMessenger,
  serverEmitter,
}: {
  connection: Connection<unknown>,
  hashToUrl: (hash: Hash<unknown>) => string,
  createRendererMessenger: () => Promise<ServerRendererMessenger>,
  bundlerMessenger?: ServerBundlerMessenger,
  serverEmitter: ServerEmitter,
}) => {
  let currentRendererProm: Promise<ServerRendererMessenger>
  reloadRenderer()
  const messenger: ServerClientMessenger = createMessenger({
    impl: {
      async lookupRaw(hash){
        return hashToUrl(hash)
      },
      async lookupRef(loc){
        const renderer = await getRenderer()
        const hash = await renderer.lookupRef(loc)
        return hashToUrl(hash)
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

  messenger.emit("reload", serverEmitter.on("reload"))
  if(bundlerMessenger) {
    messenger.emit("bundleStart", bundlerMessenger.on("bundleStart"))
    messenger.emit("bundleFinish", bundlerMessenger.on("bundleFinish"))
  }

  return messenger

  async function getRenderer(){
    let lastRendererProm, renderer
    do renderer = await (lastRendererProm = currentRendererProm)
    while(lastRendererProm !== currentRendererProm) // Some time has passed, so there may be a new renderer
    return renderer
  }

  function reloadRenderer(){
    currentRendererProm?.then(r => r.destroy(true))
    currentRendererProm = createRendererMessenger().then(renderer => {
      messenger.emit("log", renderer.on("log"))
      return renderer
    })
  }
}
