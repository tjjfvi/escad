
import "../stylus/Hierarchy.styl"
import React, { useContext } from "react"
import { observer, useObservable } from "rhobo"
import { ClientState } from "./ClientState"
import { HierarchyToTreeEngine, HierarchyView } from "./HierarchyView"
import { Pane } from "./Pane"
import { httDefaultEngine } from "./HierarchyView/httDefaultEngine"
import { Dropdown } from "./Dropdown"
import { httSimpleEngine } from "./HierarchyView/httSimpleEngine"

export const HierarchyPane = observer(() => {
  const engine = useObservable<HierarchyToTreeEngine>(httDefaultEngine)
  const state = useContext(ClientState.Context)
  const hierarchy = state.hierarchy()
  if(hierarchy)
    return <Pane right name="Hierarchy">
      <Dropdown value={engine} options={{
        "Default": httDefaultEngine,
        "Simple": httSimpleEngine,
      }}/>
      <HierarchyView hierarchy={hierarchy} selectable={true} engine={engine()}/>
    </Pane>
  return null
})
