// @ts-nocheck

import React from "react";
import ReactDOM from "react-dom";
import { App, ClientState } from "@escad/client";
import { artifactManager } from "@escad/core";
import { brandConnection, Connection, filterConnection, mapConnection } from "@escad/messages";

const connection: Connection<unknown> = brandConnection(
  mapConnection(
    filterConnection({
      send: msg => window.parent.postMessage(msg, "*"),
      onMsg: cb => window.addEventListener("message", cb),
      offMsg: cb => window.removeEventListener("message", cb),
    }, ev => ev.origin === location.origin),
    x => x,
    ev => ev.data
  ),
  location.href,
)
const state = new ClientState(connection, artifactManager);
state.status("connected");
state.listenForInfo();
state.listenForBundle();
ReactDOM.render(<App state={state}/>, document.getElementById("root"));
