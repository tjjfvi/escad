// @style "./stylus/StringLog.styl"
import React from "../deps/react.ts";
import { StringLog } from "../core/mod.ts";
import { registerLogType } from "./LogsPane.tsx";

const StringLogView = ({ log }: { log: StringLog }) => (
  <span>{log.message}</span>
);

registerLogType<StringLog>({
  id: StringLog.id,
  className: "StringLog",
  component: StringLogView,
});
