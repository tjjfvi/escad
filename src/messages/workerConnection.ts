
import { Connection } from "./Connection.ts"
import { transformConnection } from "./transformConnection.ts"

/* istanbul ignore next: covered by types, difficult to test */
export const workerConnection = (worker: Worker): Connection<unknown> =>
  transformConnection({
    send: msg => worker.postMessage(msg),
    onMsg: cb => {
      worker.addEventListener("message", cb)
      return () => worker.removeEventListener("message", cb)
    },
    destroy: () => worker.terminate(),
  }, msg => msg, (e: MessageEvent) => e.data)
