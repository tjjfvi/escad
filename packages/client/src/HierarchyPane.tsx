
import "../stylus/Hierarchy.styl"
import React, { useContext } from "react"
import { observer } from "rhobo"
import { ClientState } from "./ClientState"
import { HierarchyView } from "./HierarchyView"
import { Pane } from "./Pane"

export const HierarchyPane = observer(() => {
  const state = useContext(ClientState.Context)
  const hierarchy = state.hierarchy()
  if(hierarchy)
    return <Pane right name="Hierarchy">
      <HierarchyView hierarchy={hierarchy} selectable={true}/>
    </Pane>
  return null
})
