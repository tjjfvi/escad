import "../core/mod.ts"; // register serializers, needed for talking to renderer

import {
  Connection,
  createEventEmitter,
  createMessenger,
  EventEmitter,
  logConnection,
} from "../messages/mod.ts";
import {
  ServerClientMessenger,
  ServerRendererMessenger,
  ServerRendererShape,
} from "../protocol/mod.ts";
import { ServerTranspilerMessenger } from "../protocol/mod.ts";

export interface ServerHost {
  createRendererConnection: () => Connection<unknown>;
  transpilerConnection: Connection<unknown>;
  coreClientUrl: string;
  writeClientRoot: (source: string) => Promise<void>;
  getTranspiledUrl: (url: string) => string;
  mapClientPlugins?: (url: string) => string;
  initialPump?: boolean;
}

export type ServerEvents = {
  changeObserved: [];
};

export interface Server {
  addClient(connection: Connection<unknown>): { destroy: () => void };
  transpiler: ServerTranspilerMessenger;
  events: EventEmitter<ServerEvents>;
}

export const createServer = async ({
  createRendererConnection,
  transpilerConnection,
  coreClientUrl,
  writeClientRoot,
  getTranspiledUrl,
  mapClientPlugins = (x) => x,
  initialPump = true,
}: ServerHost): Promise<Server> => {
  const createRendererMessenger = (
    lookupRaw: ServerRendererShape["lookupRaw"],
  ): ServerRendererMessenger =>
    createMessenger({
      impl: { lookupRaw },
      connection: logConnection(createRendererConnection()),
    });

  const transpiler: ServerTranspilerMessenger = createMessenger({
    impl: {},
    connection: transpilerConnection,
  });

  let events = createEventEmitter<ServerEvents>();

  let lastClientPlugins: readonly string[] = ["_"];

  if (initialPump) {
    const rootRenderer = createRendererMessenger(async () => null);
    const loadInfo = await rootRenderer.loadFile();
    rootRenderer.destroy();
    await updateClientPlugins(loadInfo.clientPlugins);
  } else {
    await updateClientPlugins([]);
  }

  return {
    addClient(connection) {
      const messenger = createServerClientMessenger(connection);
      return { destroy: () => messenger.destroy() };
    },
    transpiler,
    events,
  };

  async function updateClientPlugins(clientPlugins: readonly string[]) {
    if (clientPlugins + "" === lastClientPlugins + "") return;
    lastClientPlugins = clientPlugins;
    let files = [coreClientUrl, ...clientPlugins.map(mapClientPlugins)];
    let content = files.map((x) =>
      `import ${JSON.stringify(getTranspiledUrl(x))}`
    ).join("\n");
    await writeClientRoot(content);
    for (let file of files) {
      await transpiler.transpile(file, false);
    }
  }

  function createServerClientMessenger(connection: Connection<unknown>) {
    let renderer: ServerRendererMessenger;
    const messenger: ServerClientMessenger = createMessenger({
      impl: {
        async lookupRef(loc) {
          const hash = await renderer.lookupRef(loc);
          return hash;
        },
        async run(params) {
          reloadRenderer();
          console.log("hmm");
          const info = await renderer.run(params);
          updateClientPlugins(info.clientPlugins);
          messenger.emit("info", info);
          return info;
        },
      },
      connection,
    });
    reloadRenderer();
    console.log("hmm2");

    messenger.emit("reload", transpiler.on("transpileFinish"));
    messenger.emit("changeObserved", events.on("changeObserved"));

    return messenger;

    function reloadRenderer() {
      console.log("Reloading renderer");
      renderer = createRendererMessenger(messenger.lookupRaw);
      console.log("WOOT");
      messenger.emit("log", renderer.on("log"));
      renderer.on("renderStart", () => console.log("Render started"));
      renderer.on("renderFinish", () => console.log("Render finished"));
      return renderer;
    }
  }
};
