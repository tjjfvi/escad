
import { Hierarchy, HashMap } from "@escad/core"
import React, { useRef, useState } from "react"
import { useValue } from "rhobo"
import { ResizeSensor } from "css-element-queries"
import { StateMemo } from "./State"
import { TreeView } from "./TreeView"
import { hierarchyToTree } from "./hierarchyToTree"

export const HierarchyView = ({ hierarchy, selectable }: { hierarchy: Hierarchy, selectable: boolean }) => {
  const [width, setWidth] = useState<number>(0)
  const sensorRef = useRef<ResizeSensor>()
  const stateMemo = useValue<StateMemo>(() => new HashMap())
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
      tree={hierarchyToTree([], hierarchy, stateMemo)}
      selectable={selectable}
    />
  </div>
}
