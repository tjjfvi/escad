
import { checkTypeProperty } from "./checkTypeProperty"
import { ScopedId } from "./Id"

export interface Log {
  type: ScopedId<"Log">,
  level?: LogLevel,
}

export type LogLevel = "log" | "warn" | "error"

export const Log = {
  isLog: checkTypeProperty.idScope<Log>("Log"),
}
