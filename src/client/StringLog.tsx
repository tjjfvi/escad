/** @jsxImportSource solid */
// @style "./stylus/StringLog.styl"
import { StringLog } from "../core/mod.ts";
import { registerLogType } from "./LogsPane.tsx";

const StringLogView = ({ log }: { log: StringLog }) => (
  <span>{log.message}</span>
);

registerLogType<StringLog>({
  id: StringLog.id,
  class: "StringLog",
  component: StringLogView,
});
