
import { Hierarchy } from "@escad/core"
import React, { useRef, useState } from "react"
import { useValue } from "rhobo"
import { ResizeSensor } from "css-element-queries"
import { StateMemo } from "./State"
import { TreeView } from "./TreeView"
import { hierarchyToTree, HierarchyToTreeEngine } from "./hierarchyToTree"
import { httDetailedEngine } from "./httDetailedEngine"

export interface HierarchyViewProps {
  hierarchy: Hierarchy,
  selectable?: boolean,
  engine?: HierarchyToTreeEngine,
}

export const HierarchyView = ({ hierarchy, selectable = false, engine = httDetailedEngine }: HierarchyViewProps) => {
  const [width, setWidth] = useState<number>(0)
  const sensorRef = useRef<ResizeSensor>()
  const stateMemo = useValue<StateMemo>(() => new Map())
  return <div
    ref={el => {
      sensorRef.current?.detach()
      if(!el) return
      const sensor = new ResizeSensor(el, () => {
        if(el.clientWidth !== width) setWidth(el.clientWidth)
      })
      sensorRef.current = sensor
    }}
  >
    <TreeView
      width={width}
      tree={hierarchyToTree(engine, hierarchy, stateMemo)}
      selectable={selectable}
    />
  </div>
}
