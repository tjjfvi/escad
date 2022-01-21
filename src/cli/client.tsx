import React from "react.ts";
import ReactDOM from "react-dom.ts";
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

if (process.env.DEV_MODE === "true") {
  state.clientStatus.on("update", () => {
    if (state.clientStatus() === "reload") {
      window.location.reload();
    }
  });
}
