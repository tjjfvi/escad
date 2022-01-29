import { Hierarchy } from "./Hierarchy.ts";
import { HierarchyLog } from "./HierarchyLog.ts";
import { Log, LogLevel } from "./Log.ts";
import { Promisish } from "./Promisish.ts";
import { StringLog } from "./StringLog.ts";

export class Logger {
  logs: Log[] = [];

  private listeners = new Set<(value: Log | null) => void>();

  private lastLogPromise?: Promise<unknown>;
  async log(logPromise: Promisish<Log | null>) {
    const [log] = await (this.lastLogPromise = Promise.all([
      logPromise,
      this.lastLogPromise,
    ]));
    if (!log) {
      this.logs = [];
    } else {
      this.logs.push(log);
    }
    this.listeners.forEach((fn) => fn(log));
  }

  clear() {
    this.log(null);
  }

  onLog(listener: (value: Log | null) => void) {
    this.listeners.add(listener);
    return () => void this.listeners.delete(listener);
  }
}

export const logger = new Logger();

export function baseLog(messages: unknown[], level: LogLevel) {
  let stringMessageAcc: string[] = [];
  for (const message of messages) {
    if (
      false ||
      typeof message === "string" ||
      typeof message === "boolean" ||
      typeof message === "bigint" ||
      typeof message === "undefined" ||
      typeof message === "number" ||
      message === null
    ) {
      stringMessageAcc.push(message + "");
    } else {
      logStringMessageAcc();
      logger.log(
        Hierarchy.from(message).then((hierarchy) =>
          HierarchyLog.create(hierarchy, level)
        ),
      );
    }
  }

  logStringMessageAcc();

  function logStringMessageAcc() {
    if (stringMessageAcc.length) {
      logger.log(StringLog.create(stringMessageAcc.join(" "), level));
    }
    stringMessageAcc = [];
  }
}

export function log(...messages: unknown[]) {
  baseLog(messages, "log");
}
