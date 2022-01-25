import {
  brandConnection,
  filterConnection,
  transformConnection,
} from "../messages/mod.ts";
import React from "../deps/react.ts";
import ReactDOM from "../deps/react-dom.ts";
import { App, ClientState } from "../client/mod.ts";
import { artifactManager } from "../core/mod.ts";
import { VfsArtifactStore } from "./VfsArtifactStore.ts";

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
  (hash) => "/vfs/artifacts/raw/" + hash,
);
clientState.removeStatusSet("Connection");
clientState.connect();
clientState.serverStatus("connected");
ReactDOM.render(<App state={clientState} />, document.getElementById("root"));
