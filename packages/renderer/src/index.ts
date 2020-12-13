
import { artifactManager, FsArtifactStore, hash } from "@escad/core";
import { messenger } from "./messenger";
import { ServerRendererMessage, ServerRendererMessageTypes } from "@escad/server-renderer-messages";
import { load, run } from "./load";

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
    const artifact = await artifactManager.lookupRef(loc);
    messenger.send({
      type: "lookupRefResponse",
      id,
      hash: hash(artifact),
    })
  },
  run: ({ id, params }) => {
    run(id, params);
  },
}

export * from "./renderFunction";
