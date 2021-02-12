import { createEmittableAsyncIterable, createMessenger, noopConnection } from "@escad/messages";
import {
  LoadInfo,
  RendererServerMessengerShape,
  ServerRendererMessenger,
  ServerRendererMessengerShape
} from "@escad/server-renderer-messages";
import { createServerRendererMessenger } from "./rendererMessenger";

export const createRendererDispatcher = (
  artifactsDir: string,
  maxRenderers: number,
  createRenderer: () => ServerRendererMessenger,
): ServerRendererMessenger => {
  const [a, b] = noopConnection();
  const publicMessenger = createServerRendererMessenger(a, artifactsDir);

  let idleRenderers: ServerRendererMessenger[] | undefined;
  let renderers: ServerRendererMessenger[] = [];
  resetRenderers();

  const [triggerLoad, onLoad] = createEmittableAsyncIterable<LoadInfo>();
  let curLoadInfo: LoadInfo | undefined;
  createMessenger<RendererServerMessengerShape, ServerRendererMessengerShape>({
    run(params){
      return getRenderer(renderer =>
        renderer.req.run(params)
      )
    },
    lookupRef(loc){
      return getRenderer(renderer =>
        renderer.req.lookupRef(loc)
      );
    },
    async load(path){
      resetRenderers();
      const loadInfo = await Promise.race(renderers.map(renderer =>
        renderer.req.load(path)
      ));
      curLoadInfo = loadInfo;
      triggerLoad(loadInfo);
      return loadInfo;
    },
    async *onLoad(){
      if(curLoadInfo) yield curLoadInfo;
      yield* onLoad();
    },
  }, b)

  return publicMessenger;

  async function getRenderer<T>(cb: (renderer: ServerRendererMessenger) => Promise<T>): Promise<T>{
    const renderer = renderers.pop() ?? createRenderer();
    renderers.unshift(renderer)
    const result = await cb(renderer);
    return result;
  }

  function resetRenderers(){
    renderers.forEach(renderer => renderer.destroy());
    renderers = idleRenderers ?? createRenderers();
    // idleRenderers = createRenderers();
  }

  function createRenderers(){
    return Array(maxRenderers).fill(0).map(() => createRenderer());
  }
}
