import React from "../deps/react.ts";
import ReactDOM from "https://cdn.esm.sh/v64/react-dom@17.0.2/es2021/react-dom.development.js";
import { App, WebSocketClientState } from "../client/mod.ts";
import { artifactManager, InMemoryArtifactStore } from "../core/mod.ts";

artifactManager.artifactStores.unshift(new InMemoryArtifactStore());
const state = new WebSocketClientState(
  "ws" + window.location.toString().slice(4) + "ws/",
  artifactManager,
  (hash) => `/artifacts/raw/${hash}`,
);
console.log(state);
ReactDOM.render(<App state={state} />, document.getElementById("root"));

state.clientStatus.on("update", () => {
  if (state.clientStatus() === "reload") {
    window.location.reload();
  }
});
