
import "../stylus/Hierarchy.styl"
import React, { useContext } from "react"
import { observer, useObservable } from "rhobo"
import { ClientState } from "./ClientState"
import { HierarchyToTreeEngine, HierarchyView, httDetailedEngine, httOutlineEngine } from "./HierarchyView"
import { Pane } from "./Pane"
import { Dropdown } from "./Dropdown"

export const HierarchyPane = observer(() => {
  const engine = useObservable<HierarchyToTreeEngine>(httOutlineEngine)
  const state = useContext(ClientState.Context)
  const hierarchy = state.hierarchy()
  if(hierarchy)
    return <Pane right name="Hierarchy">
      <Dropdown value={engine} options={{
        "Outline": httOutlineEngine,
        "Detailed": httDetailedEngine,
      }}/>
      <HierarchyView hierarchy={hierarchy} selectable={true} engine={engine()}/>
    </Pane>
  return null
})
