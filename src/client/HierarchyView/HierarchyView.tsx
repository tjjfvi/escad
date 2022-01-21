import { Hierarchy } from "../core/mod.ts";
import React, { useRef, useState } from "react.ts";
import { useValue } from "rhobo.ts";
import { ResizeSensor } from "css-element-queries.ts";
import { StateMemo } from "./State.ts";
import { TreeView } from "./TreeView.ts";
import { hierarchyToTree, HierarchyToTreeEngine } from "./hierarchyToTree.ts";
import { httDetailedEngine } from "./httDetailedEngine.ts";

export interface HierarchyViewProps {
  hierarchy: Hierarchy;
  selectable?: boolean;
  engine?: HierarchyToTreeEngine;
}

export const HierarchyView = (
  { hierarchy, selectable = false, engine = httDetailedEngine }:
    HierarchyViewProps,
) => {
  const [width, setWidth] = useState<number>(0);
  const sensorRef = useRef<ResizeSensor>();
  const stateMemo = useValue<StateMemo>(() => new Map());
  return (
    <div
      ref={(el) => {
        sensorRef.current?.detach();
        if (!el) return;
        const sensor = new ResizeSensor(el, () => {
          if (el.clientWidth !== width) setWidth(el.clientWidth);
        });
        sensorRef.current = sensor;
      }}
    >
      <TreeView
        width={width}
        tree={hierarchyToTree(engine, hierarchy, stateMemo)}
        selectable={selectable}
      />
    </div>
  );
};
