import { checkTypeProperty, Id } from "../utils/mod.ts";
import { Hierarchy } from "../hierarchy/mod.ts";
import { Log, LogLevel } from "./Log.ts";

const hierarchyLogId = Id.create(
  import.meta.url,
  "@escad/core",
  "Log",
  "HierarchyLog",
);

export interface HierarchyLog extends Log {
  type: typeof hierarchyLogId;
  hierarchy: Hierarchy;
}

export const HierarchyLog = {
  id: hierarchyLogId,
  create: (hierarchy: Hierarchy, level?: LogLevel): HierarchyLog => ({
    type: hierarchyLogId,
    hierarchy,
    level,
  }),
  isHierarchyLog: checkTypeProperty.id<HierarchyLog>(hierarchyLogId),
};
