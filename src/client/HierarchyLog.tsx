/** @jsxImportSource solid */
// @style "./stylus/HierarchyLog.styl"
import { HierarchyLog } from "../core/mod.ts";
import { HierarchyView } from "./HierarchyView/mod.ts";
import { registerLogType } from "./LogsPane.tsx";

const HierarchyLogView = ({ log }: { log: HierarchyLog }) => (
  <HierarchyView hierarchy={log.hierarchy} />
);

registerLogType<HierarchyLog>({
  id: HierarchyLog.id,
  class: "HierarchyLog",
  component: HierarchyLogView,
});
