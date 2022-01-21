import "../stylus/Hierarchy.styl";
import React, { useContext } from "react.ts";
import { observer, useObservable } from "rhobo.ts";
import { ClientState } from "./ClientState.ts";
import {
  HierarchyToTreeEngine,
  HierarchyView,
  httDetailedEngine,
  httOutlineEngine,
} from "./HierarchyView.ts";
import { Pane } from "./Pane.ts";
import { Dropdown } from "./Dropdown.ts";

export const HierarchyPane = observer(() => {
  const engine = useObservable<HierarchyToTreeEngine>(httOutlineEngine);
  const state = useContext(ClientState.Context);
  const hierarchy = state.hierarchy();
  if (hierarchy) {
    return (
      <Pane right name="Hierarchy">
        <Dropdown
          value={engine}
          options={{
            "Outline": httOutlineEngine,
            "Detailed": httDetailedEngine,
          }}
        />
        <HierarchyView
          hierarchy={hierarchy}
          selectable={true}
          engine={engine()}
        />
      </Pane>
    );
  }
  return null;
});
