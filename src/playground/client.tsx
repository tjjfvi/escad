/** @jsxImportSource solid */
import {
  brandConnection,
  createMessenger,
  filterConnection,
  logConnection,
  transformConnection,
} from "../messaging/mod.ts";
import { createSignal, render } from "../deps/solid.ts";
import {
  $wrappedValue,
  artifactManager,
  conversionRegistry,
  InMemoryArtifactStore,
} from "../core/mod.ts";
import {
  App,
  Loading,
  mdi,
  ServerArtifactStore,
  Status,
  trackRendererActive,
} from "../client/mod.ts";
import { VfsArtifactStore } from "./VfsArtifactStore.ts";
import type { ShareMessengerShape } from "./ClientFrame.tsx";
import { ClientServerMessenger } from "../server/protocol/server-client.ts";

artifactManager.artifactStores.unshift(new VfsArtifactStore());

window.addEventListener("message", (ev) => {
  console.log("!!!", ev);
});

const baseConnection = logConnection(
  transformConnection(
    filterConnection({
      send: (msg) => window.parent.postMessage(msg, "*"),
      onMsg: (cb) => {
        console.log("onMsg");
        window.addEventListener("message", cb);
        return () => {
          console.log("offMsg");
          window.removeEventListener("message", cb);
        };
      },
    }, (ev: any): ev is unknown => ev.origin === location.origin),
    (x) => x,
    (ev: any) => ev.data,
  ),
  "client",
);

const shareMessenger = createMessenger<{}, ShareMessengerShape, {}>({
  impl: {},
  connection: brandConnection(baseConnection, "share"),
});

type ShareState = keyof (typeof statuses)["share"];
let shareResult: string | null;

const statuses = _statuses();
const [clientCurrent, setClientCurrent] = createSignal(true);
const [shareState, setShareState] = createSignal<ShareState>("share");
const rendererStatus = () => {
  if (rendererActive()) {
    return statuses.renderer.active;
  } else {
    return statuses.renderer.inactive;
  }
};
const clientStatus = () => {
  if (clientCurrent()) {
    return statuses.client.current;
  } else {
    return statuses.client.reload;
  }
};
const shareStatus = () => {
  return statuses.share[shareState()];
};

const connection = brandConnection(baseConnection, "client");
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
      clientStatus(),
      shareStatus(),
    ]}
  />
), root);

async function share() {
  setShareState("sharing");
  shareResult = await shareMessenger.share();
  if (shareResult) {
    await navigator.clipboard.writeText(shareResult);
    setShareState("shared");
    await messenger.once("changeObserved");
    setShareState("share");
  } else {
    setShareState("error");
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
    },
    share: {
      share: status({
        description: "Share",
        class: "inactive",
        icon2: mdi.share,
        onClick: share,
      }),
      sharing: status({
        description: "Creating URL",
        class: "active",
        icon1: mdi.share,
        icon2: Loading,
      }),
      shared: status({
        description: "Copied URL",
        class: "good",
        icon1: mdi.share,
        icon2: mdi.check,
        onClick: () => navigator.clipboard.writeText(shareResult!),
      }),
      error: status({
        description: "Error",
        class: "bad",
        icon1: mdi.share,
        icon2: mdi.close,
      }),
    },
  };

  function status(status: Status) {
    return status;
  }
}
