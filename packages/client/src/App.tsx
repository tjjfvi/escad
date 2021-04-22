
import React from "react"
import { Statuses } from "./Status"
import { HierarchyPane } from "./HierarchyPane"
import { ParametersPane } from "./ParametersPane"
import { Preview } from "./Preview"
import { ClientState } from "./ClientState"

export const App = ({ state }: { state: ClientState }) =>
  <ClientState.Context.Provider value={state}>
    <ParametersPane/>
    <Preview/>
    <Statuses/>
    <HierarchyPane/>
  </ClientState.Context.Provider>
