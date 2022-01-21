import React from "react.ts";
import { Statuses } from "./Status.ts";
import { HierarchyPane } from "./HierarchyPane.ts";
import { ParametersPane } from "./ParametersPane.ts";
import { Preview } from "./Preview.ts";
import { ClientState } from "./ClientState.ts";
import { LogsPane } from "./LogsPane.ts";

export const App = ({ state }: { state: ClientState }) => (
  <ClientState.Context.Provider value={state}>
    <ParametersPane />
    <Preview />
    <Statuses />
    <HierarchyPane />
    <LogsPane />
  </ClientState.Context.Provider>
);
