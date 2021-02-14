
import "../stylus/Hierarchy.styl";
import React, { useContext } from "react";
import { observer } from "rhobo";
import { ClientState } from "./ClientState";
import { HierarchyView } from "./HierarchyView";
import { Pane } from "./Pane";

const maxLength = 30;

export const HierarchyPane = observer(() => {
  const state = useContext(ClientState.Context);
  const hierarchy = state.hierarchy();
  if(hierarchy)
    return <Pane right name="Hierarchy">
      <HierarchyView maxLength={maxLength} hierarchy={hierarchy}/>
    </Pane>
  return null
});
