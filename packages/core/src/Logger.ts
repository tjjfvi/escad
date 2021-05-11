
import { Log } from "./Log"

export class Logger {

  logs: Log[] = []

  private listeners = new Set<(value: Log | null) => void>()

  log(log: Log | null){
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
