import React from "../deps/react.ts";
import { Statuses } from "./Status.tsx";
import { HierarchyPane } from "./HierarchyPane.tsx";
import { ParametersPane } from "./ParametersPane.tsx";
import { Preview } from "./Preview.tsx";
import { ClientState } from "./ClientState.ts";
import { LogsPane } from "./LogsPane.tsx";

export const App = ({ state }: { state: ClientState }) => (
  <ClientState.Context.Provider value={state}>
    <ParametersPane />
    <Preview />
    <Statuses />
    <HierarchyPane />
    <LogsPane />
  </ClientState.Context.Provider>
);
