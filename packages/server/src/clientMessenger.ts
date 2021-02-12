import { Hash } from "@escad/core";
import { Connection, createMessenger, dedupeAsyncIterable, zipAsyncIterables } from "@escad/messages";
import { ServerClientMessenger } from "@escad/server-client-messages";
import { ServerRendererMessenger } from "@escad/server-renderer-messages";

export const createServerClientMessenger = (
  connection: Connection<unknown>,
  rendererMessenger: ServerRendererMessenger,
  hashToUrl: (hash: Hash) => string,
) => {
  const messenger: ServerClientMessenger = createMessenger({
    async *ping(period){
      period = Math.min(period, 1000);
      while(true) {
        await new Promise(res => setTimeout(res, period));
        yield;
      }
    },
    async lookupRaw(hash){
      return hashToUrl(hash);
    },
    async lookupRef(loc){
      const hash = await rendererMessenger.req.lookupRef(loc);
      return hashToUrl(hash);
    },
    info: dedupeAsyncIterable(info),
  }, connection)

  return messenger;

  async function* info(){
    for await (const [params, loadInfo] of zipAsyncIterables(messenger.req.params(), rendererMessenger.req.onLoad())) {
      if(!loadInfo) continue;
      if(!params)
        yield { ...{ ...loadInfo, clientPlugins: undefined } }
      else
        yield await rendererMessenger.req.run(params);
    }
  }
}
