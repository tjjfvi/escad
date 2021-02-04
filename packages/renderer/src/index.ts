
import { artifactManager, ConversionRegistry, conversionRegistry, ExportTypeRegistry, hash, Id } from "@escad/core";
import { messenger } from "./messenger";
import { ServerRendererMessage, ServerRendererMessageTypes } from "@escad/server-renderer-messages";
import { load, run } from "./load";
import { FsArtifactStore } from "./FsArtifactStore";

messenger.on("message", <T extends ServerRendererMessageTypes>(message: ServerRendererMessage<T>) => {
  messageHandlers[message.type](message as any);
})

type MessageHandlers = {
  [K in ServerRendererMessage["type"]]: (message: ServerRendererMessage<K>) => void
}

const messageHandlers: MessageHandlers = {
  artifactsDir: ({ artifactsDir }) => {
    artifactManager.artifactStores.unshift(new FsArtifactStore(artifactsDir));
  },
  load,
  lookupRef: async ({ id, loc }) => {
    const type = refType(loc);
    const timerName = type ? type + " " + id : undefined;
    if(type) console.time(timerName);
    const artifact = await artifactManager.lookupRef(loc);
    await artifactManager.storeRaw(artifact);
    messenger.send({
      type: "lookupRefResponse",
      id,
      hash: hash(artifact),
    })
    if(type) console.timeEnd(timerName);
  },
  run: ({ id, params }) => {
    run(id, params);
  },
}

const refType = (loc: readonly unknown[]): string | undefined => {
  if(Id.isId(loc[0]) && Id.equal(loc[0], ConversionRegistry.artifactStoreId))
    return "Convert";
  if(Id.isId(loc[0]) && Id.equal(loc[0], ExportTypeRegistry.artifactStoreId))
    return "Export";
}

export * from "./renderFunction";
