
import type { ChildProcess, Serializable } from "child_process";
import { Connection } from "./Connection";

/* istanbul ignore next: covered by types, difficult to test */
export const childProcessConnection = (childProcess: ChildProcess): Connection<Serializable> => ({
  send: value => childProcess.send(value),
  onMsg: cb => childProcess.on("message", cb),
  offMsg: cb => childProcess.off("message", cb),
  destroy: () => childProcess.kill(),
})
