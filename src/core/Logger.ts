
import { Hierarchy } from "./Hierarchy"
import { HierarchyLog } from "./HierarchyLog"
import { Log, LogLevel } from "./Log"
import { Promisish } from "./Promisish"
import { StringLog } from "./StringLog"

export class Logger {

  logs: Log[] = []

  private listeners = new Set<(value: Log | null) => void>()

  private lastLogPromise?: Promise<unknown>
  async log(logPromise: Promisish<Log | null>){
    const [log] = await (this.lastLogPromise = Promise.all([
      logPromise,
      this.lastLogPromise,
    ]))
    if(!log)
      this.logs = []
    else
      this.logs.push(log)
    this.listeners.forEach(fn => fn(log))
  }

  clear(){
    this.log(null)
  }

  onLog(listener: (value: Log | null) => void){
    this.listeners.add(listener)
    return () => void this.listeners.delete(listener)
  }

}

export const logger = new Logger()

export function baseLog(messages: unknown[], level: LogLevel){
  let stringMessageAcc: string[] = []
  for(const message of messages)
    if(false
      || typeof message === "string"
      || typeof message === "boolean"
      || typeof message === "bigint"
      || typeof message === "undefined"
      || typeof message === "number"
      || message === null
    )
      stringMessageAcc.push(message + "")
    else {
      logStringMessageAcc()
      logger.log(Hierarchy.from(message).then(hierarchy => HierarchyLog.create(hierarchy, level)))
    }

  logStringMessageAcc()

  function logStringMessageAcc(){
    if(stringMessageAcc.length)
      logger.log(StringLog.create(stringMessageAcc.join(" "), level))
    stringMessageAcc = []
  }
}

export function log(...messages: unknown[]){
  baseLog(messages, "log")
}
