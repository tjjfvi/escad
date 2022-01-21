
import "../stylus/HierarchyLog.styl"
import React from "react.ts"
import { HierarchyLog } from "../core/mod.ts"
import { registerLogType } from "./LogsPane.ts"
import { HierarchyView } from "./HierarchyView.ts"

const HierarchyLogView = ({ log }: { log: HierarchyLog }) =>
  <HierarchyView hierarchy={log.hierarchy} selectable={false}/>

registerLogType<HierarchyLog>({
  id: HierarchyLog.id,
  className: "HierarchyLog",
  component: HierarchyLogView,
})
