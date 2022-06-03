/** @jsxImportSource solid */
import { Hierarchy } from "../../core/mod.ts";
import { ResizeSensor } from "../../deps/css-element-queries.ts";
import { StateMemo } from "./State.ts";
import { TreeView } from "./TreeView.tsx";
import {
  hierarchyToTree,
  HierarchyToTreeEngine,
  SelectableComponent,
} from "./hierarchyToTree.tsx";
import { httDetailedEngine } from "./httDetailedEngine.ts";
import {
  createRenderEffect,
  createSignal,
  onCleanup,
} from "../../deps/solid.ts";

export interface HierarchyViewProps {
  hierarchy: Hierarchy;
  engine?: HierarchyToTreeEngine;
  Selectable?: SelectableComponent;
}

export const HierarchyView = (props: HierarchyViewProps) => {
  const [width, setWidth] = createSignal(0);
  const stateMemo = new Map();
  const el = (
    <div>
      <TreeView
        width={width()}
        tree={hierarchyToTree(
          props.engine ?? httDetailedEngine,
          props.hierarchy,
          stateMemo,
          props.Selectable ?? DummySelectable,
        )}
      />
    </div>
  ) as Element;
  createRenderEffect(() => {
    const sensor = new ResizeSensor(el, () => {
      setWidth(el.clientWidth);
    });
    onCleanup(() => sensor.detach());
  });
  return el;
};

export const DummySelectable: SelectableComponent = (props) =>
  () => props.children;
