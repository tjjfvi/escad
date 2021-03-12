
import { Connection } from "./Connection"

/* istanbul ignore next: covered by types, difficult to test */
export const workerConnection = (worker: Worker): Connection<unknown> => ({
  send: msg => worker.postMessage(msg),
  onMsg: cb => worker.addEventListener("message", e => cb(e.data)),
  offMsg: cb => worker.removeEventListener("message", e => cb(e.data)),
  destroy: () => worker.terminate(),
})
