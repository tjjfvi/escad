/** @jsxImportSource solid */
import { createSignal, render } from "../deps/solid.ts";
import {
  App,
  Loading,
  mdi,
  ServerArtifactStore,
  Status,
  trackRendererActive,
} from "../client/mod.ts";
import {
  createConnectionPair,
  createMessenger,
  logConnection,
  serializeConnection,
} from "../messaging/mod.ts";
import { ClientServerMessenger } from "../server/protocol/server-client.ts";
import {
  $wrappedValue,
  artifactManager,
  conversionRegistry,
  InMemoryArtifactStore,
} from "../core/mod.ts";

// TODO: improve
const wsUrl = "ws" + window.location.toString().slice(4) + "ws/";

const statuses = _statuses();
type ConnectionState = keyof (typeof statuses)["connection"];
const [connectionState, setConnectionState] = createSignal<ConnectionState>(
  "disconnected",
);
const [clientCurrent, setClientCurrent] = createSignal(true);
const connectionStatus = () => {
  return statuses.connection[connectionState()];
};
const rendererStatus = () => {
  if (rendererActive()) {
    if (connectionState() === "connected") {
      return statuses.renderer.active;
    } else {
      return statuses.renderer.waiting;
    }
  } else {
    if (connectionState() === "connected") {
      return statuses.renderer.inactive;
    } else {
      return statuses.renderer.unknown;
    }
  }
};
const clientStatus = () => {
  if (connectionState() === "connected") {
    if (clientCurrent()) {
      return statuses.client.current;
    } else {
      return statuses.client.reload;
    }
  } else {
    return statuses.client.unknown;
  }
};

const messenger = _wsMessenger();

const rendererActive = trackRendererActive(messenger);

messenger.on("reload", () => {
  setClientCurrent(false);
});

const root = document.getElementById("root")!;
while (root.firstChild) root.removeChild(root.firstChild);
render(() => (
  <App
    conversionRegistry={conversionRegistry}
    artifactManager={artifactManager}
    messenger={messenger}
    statuses={[
      rendererStatus(),
      connectionStatus(),
      clientStatus(),
    ]}
  />
), root);

export function _wsMessenger(): ClientServerMessenger {
  let curWs: WebSocket | undefined;

  const [a, b] = createConnectionPair<Uint8Array, unknown>();
  b.onMsg((message) => curWs?.send(message));
  const connection = logConnection(serializeConnection(a));
  initWs();

  const messenger: ClientServerMessenger = createMessenger({
    connection,
    impl: {
      lookupRaw: async (hash) => {
        const result = await artifactManager.lookupRawWrapped(
          hash,
          new Set([serverArtifactStore]),
        );
        if (!result) return null;
        return [...$wrappedValue.serialize(result)];
      },
    },
  });

  const serverArtifactStore = new ServerArtifactStore(
    messenger,
    (hash) => `/artifacts/raw/${hash}`,
  );

  artifactManager.artifactStores.unshift(
    serverArtifactStore,
    new InMemoryArtifactStore(),
  );

  return messenger;

  async function initWs() {
    if (curWs) return;

    setConnectionState("connecting");
    await new Promise((r) => setTimeout(r, 1000)); // TODO: ?
    const ws = curWs = new WebSocket(wsUrl);
    ws.addEventListener("open", () => {
      if (curWs !== ws) {
        return ws.close();
      }
      setConnectionState("connected");
      messenger.retryAll();
      messenger.emit("changeObserved"); // TODO: improve
    });
    ws.binaryType = "arraybuffer";
    ws.addEventListener("close", () => disconnect(ws));
    ws.addEventListener("error", () => disconnect(ws));
    ws.addEventListener("message", async ({ data }) => {
      b.send(new Uint8Array(data));
    });
  }

  function disconnect(ws: WebSocket) {
    ws.close();
    if (ws !== curWs) {
      return;
    }
    setConnectionState("disconnected");
    curWs = undefined;
    setTimeout(() => initWs(), 5000);
  }
}

function _statuses() {
  return {
    renderer: {
      inactive: status({
        description: "Rendered",
        class: "good",
        icon1: mdi.cubeOutline,
        icon2: mdi.check,
      }),
      active: status({
        description: "Rendering",
        class: "active",
        icon1: mdi.cubeOutline,
        icon2: Loading,
      }),
      waiting: status({
        description: "Awaiting",
        class: "inactive",
        icon1: mdi.cubeOutline,
        icon2: Loading,
      }),
      unknown: status({
        description: "Unknown",
        class: "inactive",
        icon1: mdi.cubeOutline,
        icon2: mdi.help,
      }),
    },
    connection: {
      disconnected: status({
        description: "Disconnected",
        class: "bad",
        icon1: mdi.arrowUpDown,
        icon2: mdi.close,
      }),
      connecting: status({
        description: "Connecting",
        class: "waiting",
        icon1: mdi.arrowUpDown,
        icon2: Loading,
      }),
      connected: status({
        description: "Connected",
        class: "good",
        icon1: mdi.arrowUpDown,
        icon2: mdi.check,
      }),
    },
    client: {
      current: status({
        description: "Up to Date",
        class: "good",
        icon1: mdi.account,
        icon2: mdi.check,
      }),
      reload: status({
        description: "Reload",
        class: "attention",
        icon1: mdi.account,
        icon2: mdi.refresh,
        onClick: () => window.location.reload(),
      }),
      unknown: status({
        description: "Unknown",
        class: "unknown",
        icon1: mdi.account,
        icon2: mdi.help,
      }),
    },
  };

  function status(status: Status) {
    return status;
  }
}
