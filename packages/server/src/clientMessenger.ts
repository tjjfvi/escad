
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
  let renderer = createRendererMessenger()
  const messenger: ServerClientMessenger = createMessenger({
    impl: {
      async lookupRaw(hash){
        return hashToUrl(hash)
      },
      async lookupRef(loc){
        const hash = await (await renderer).lookupRef(loc)
        return hashToUrl(hash)
      },
      async run(params){
        (await renderer)?.destroy()
        renderer = createRendererMessenger()
        const info = await (await renderer).run(params)
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
}
