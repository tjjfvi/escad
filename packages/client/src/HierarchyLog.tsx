
import "../stylus/HierarchyLog.styl"
import React from "react"
import { HierarchyLog } from "@escad/core"
import { registerLogType } from "./LogsPane"
import { HierarchyView } from "./HierarchyView"

const HierarchyLogView = ({ log }: { log: HierarchyLog }) =>
  <HierarchyView hierarchy={log.hierarchy} selectable={false}/>

registerLogType<HierarchyLog>({
  id: HierarchyLog.id,
  className: "HierarchyLog",
  component: HierarchyLogView,
})
