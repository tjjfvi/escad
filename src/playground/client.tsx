import {
  brandConnection,
  createMessenger,
  filterConnection,
  transformConnection,
} from "../messaging/mod.ts";
import React from "../deps/react.ts";
import ReactDOM from "../deps/react-dom.ts";
import { App, ClientState, Icon, Loading, mdi } from "../client/mod.ts";
import { artifactManager } from "../core/mod.ts";
import { VfsArtifactStore } from "./VfsArtifactStore.ts";
import { observable } from "../deps/rhobo.ts";
import type { ShareMessengerShape } from "./ClientFrame.tsx";

artifactManager.artifactStores.unshift(new VfsArtifactStore());

const baseConnection = transformConnection(
  filterConnection({
    send: (msg) => window.parent.postMessage(msg, "*"),
    onMsg: (cb) => {
      window.addEventListener("message", cb);
      return () => window.removeEventListener("message", cb);
    },
  }, (ev: any): ev is unknown => ev.origin === location.origin),
  (x) => x,
  (ev: any) => ev.data,
);
const clientState = new ClientState(
  brandConnection(baseConnection, "client"),
  artifactManager,
  (hash) => "/artifacts/raw/" + hash,
);
const shareMessenger = createMessenger<{}, ShareMessengerShape, {}>({
  impl: {},
  connection: brandConnection(baseConnection, "share"),
});
clientState.removeStatusSet("Connection");
let shareState = observable("share");
let shareIcon: Icon = (props) =>
  shareState.use()() === "share" ? null : <mdi.share {...props}></mdi.share>;
let shareResult: string | null;
clientState.addStatusSet({
  name: "Save",
  state: shareState,
  icon: shareIcon,
  statuses: {
    share: {
      icon: mdi.share,
      name: "Share",
      className: "inactive",
      onClick: async () => {
        shareState("sharing");
        shareResult = await shareMessenger.share();
        if (shareResult) {
          await navigator.clipboard.writeText(shareResult);
          shareState("shared");
          await clientState.clientServerMessenger.once("changeObserved");
          shareState("share");
        } else {
          shareState("error");
        }
      },
    },
    sharing: {
      icon: Loading,
      name: "Creating URL",
      className: "active",
    },
    shared: {
      icon: mdi.check,
      name: "Copied URL",
      className: "good",
      onClick: () => navigator.clipboard.writeText(shareResult!),
    },
    error: {
      icon: mdi.close,
      name: "Error",
      className: "bad",
    },
  },
});
clientState.connect();
clientState.serverStatus("connected");
ReactDOM.render(<App state={clientState} />, document.getElementById("root"));
