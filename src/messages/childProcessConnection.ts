
import type { ChildProcess } from "child_process.ts"
import { Connection } from "./Connection.ts"

/* istanbul ignore next: covered by types, difficult to test */
export const childProcessConnection = (childProcess: ChildProcess): Connection<unknown> => ({
  send: value => childProcess.send(value as never),
  onMsg: cb => {
    childProcess.on("message", cb)
    return () => childProcess.off("message", cb)
  },
  destroy: () => childProcess.kill(),
})
