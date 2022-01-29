// @style "./stylus/HierarchyLog.styl"
import React from "../deps/react.ts";
import { HierarchyLog } from "../core/mod.ts";
import { registerLogType } from "./LogsPane.tsx";
import { HierarchyView } from "./HierarchyView/mod.ts";

const HierarchyLogView = ({ log }: { log: HierarchyLog }) => (
  <HierarchyView hierarchy={log.hierarchy} selectable={false} />
);

registerLogType<HierarchyLog>({
  id: HierarchyLog.id,
  className: "HierarchyLog",
  component: HierarchyLogView,
});
