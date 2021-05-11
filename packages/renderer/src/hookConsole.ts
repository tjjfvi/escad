
import { Hierarchy, Logger, HierarchyLog, StringLog, LogLevel } from "@escad/core"

export const hookConsole = (console: Console, logger: Logger) => {
  const consoleLog = console.log.bind(console)
  const overridenLog = console.log = (...args: unknown[]) => {
    consoleLog(...args)
    baseLog(args, "log")
  }
  const consoleWarn = console.warn.bind(console)
  console.warn = (...args: unknown[]) => {
    consoleWarn(...args)
    baseLog(args, "warn")
  }
  const consoleError = console.error.bind(console)
  console.error = (...args: unknown[]) => {
    consoleError(...args)
    baseLog(args, "error")
  }
  const consoleClear = console.clear.bind(console)
  console.clear = () => {
    consoleClear()
    logger.clear()
  }
  const consoleTimeEnd = console.timeEnd.bind(console)
  console.timeEnd = (label?: string) => {
    console.log = consoleLog
    consoleTimeEnd(label)
    console.log = overridenLog
  }

  async function baseLog(messages: unknown[], level: LogLevel){
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
