
import React from "react";
import { HierarchyView } from "./HierarchyView";
import { messenger } from "./Messenger";
import Pane from "./Pane";

const maxLength = 30;

export const HierarchyPane = () => {
  const hierarchy = messenger.hierarchy.use()();
  if(hierarchy)
    return <Pane right name="Hierarchy">
      <HierarchyView maxLength={maxLength} hierarchy={hierarchy}/>
    </Pane>
  return null
}
