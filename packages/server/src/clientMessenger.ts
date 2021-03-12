import { Hash } from "@escad/core";
import { Connection, createMessenger, dedupeAsyncIterable, zipAsyncIterables } from "@escad/messages";
import { ServerBundlerMessenger, ServerClientMessenger } from "@escad/protocol";
import { ServerRendererMessenger } from "@escad/protocol";

export const createServerClientMessenger = (
  connection: Connection<unknown>,
  hashToUrl: (hash: Hash<unknown>) => string,
  rendererMessenger: ServerRendererMessenger,
  bundlerMessenger?: ServerBundlerMessenger,
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
    onBundle: dedupeAsyncIterable(bundlerMessenger?.req.onBundle ?? async function*(){}),
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
