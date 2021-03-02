
import "../stylus/StringLog.styl"
import React from "react"
import { StringLog } from "@escad/core"
import { registerLogType } from "./LogsPane"

const StringLogView = ({ log }: { log: StringLog }) =>
  <span>{log.message}</span>

registerLogType<StringLog>({
  id: StringLog.id,
  className: "StringLog",
  component: StringLogView,
})
