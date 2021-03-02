
import { Hierarchy, Logger, HierarchyLog, StringLog, LogLevel } from "@escad/core"

export const hookConsole = (console: Console, logger: Logger) => {
  const log = console.log.bind(console)
  console.log = (...args: unknown[]) => {
    log(...args)
    standardLog(args, "log")
  }

  const warn = console.warn.bind(console)
  console.warn = (...args: unknown[]) => {
    warn(...args)
    standardLog(args, "warn")
  }

  const error = console.error.bind(console)
  console.error = (...args: unknown[]) => {
    error(...args)
    standardLog(args, "error")
  }

  const clear = console.clear.bind(console)
  console.clear = () => {
    clear()
    logger.log(null)
  }

  const timeEnd = console.timeEnd.bind(console)
  console.timeEnd = (label?: string) => {
    const overridenLog = console.log
    console.log = log
    timeEnd(label)
    console.log = overridenLog
  }

  async function standardLog(messages: unknown[], level: LogLevel){
    if(messages.every(msg =>
      typeof msg === "string"
      || typeof msg === "boolean"
      || typeof msg === "bigint"
      || typeof msg === "undefined"
      || typeof msg === "number"
      || msg === null,
    ))
      return logger.log(StringLog.create(messages.join(" "), level))
    for(const message of messages)
      logger.log(HierarchyLog.create(await Hierarchy.from(message), level))
  }
}
