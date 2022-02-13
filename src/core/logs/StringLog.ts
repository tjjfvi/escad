import { checkTypeProperty, Id } from "../utils/mod.ts";
import { Log, LogLevel } from "./Log.ts";

const stringLogId = Id.create(
  import.meta.url,
  "@escad/core",
  "Log",
  "StringLog",
);

export interface StringLog extends Log {
  type: typeof stringLogId;
  message: string;
}

export const StringLog = {
  id: stringLogId,
  create: (message: string, level?: LogLevel): StringLog => ({
    type: stringLogId,
    message,
    level,
  }),
  isStringLog: checkTypeProperty.id<StringLog>(stringLogId),
};
