// @style "./stylus/Hierarchy.styl"
import React from "../deps/react.ts";
import { observer, useObservable } from "../deps/rhobo.ts";
import { ClientState } from "./ClientState.ts";
import {
  HierarchyToTreeEngine,
  HierarchyView,
  httDetailedEngine,
  httOutlineEngine,
} from "./HierarchyView/mod.ts";
import { Pane } from "./Pane.tsx";
import { Dropdown } from "./Dropdown.tsx";

export const HierarchyPane = observer(() => {
  const engine = useObservable<HierarchyToTreeEngine>(httOutlineEngine);
  const state = React.useContext(ClientState.Context);
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
