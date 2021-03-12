import { createEmittableAsyncIterable, createMessenger, noopConnection } from "@escad/messages"
import {
  LoadInfo,
  RendererServerMessengerShape,
  ServerRendererMessenger,
  ServerRendererMessengerShape,
} from "@escad/protocol"
import { createServerRendererMessenger } from "./rendererMessenger"

export const createRendererDispatcher = (
  maxRenderers: number,
  createRenderer: () => ServerRendererMessenger | Promise<ServerRendererMessenger>,
): ServerRendererMessenger => {
  const [a, b] = noopConnection()
  const publicMessenger = createServerRendererMessenger(a)

  let renderers: Promise<ServerRendererMessenger>[] = createRenderers()

  const [triggerLoad, onLoad] = createEmittableAsyncIterable<LoadInfo>()
  let curLoadInfo: LoadInfo | undefined
  createMessenger<RendererServerMessengerShape, ServerRendererMessengerShape>({
    async run(params){
      const renderer = await getRenderer()
      return await renderer.req.run(params)
    },
    async lookupRef(loc){
      const renderer = await getRenderer()
      return await renderer.req.lookupRef(loc)
    },
    async load(path){
      resetRenderers()
      const loadInfo = await Promise.race(
        renderers.map(async renderer =>
          (await renderer).req.load(path),
        ),
      )
      curLoadInfo = loadInfo
      triggerLoad(loadInfo)
      return loadInfo
    },
    async *onLoad(){
      if(curLoadInfo) yield curLoadInfo
      yield* onLoad()
    },
  }, b)

  return publicMessenger

  async function getRenderer(): Promise<ServerRendererMessenger>{
    const renderer = renderers.pop() ?? (async () => createRenderer())()
    renderers.unshift(renderer)
    return await renderer
  }

  function resetRenderers(){
    renderers.forEach(async renderer => (await renderer).destroy())
    renderers = createRenderers()
  }

  function createRenderers(){
    return Array(maxRenderers).fill(0).map(async () => createRenderer())
  }
}
