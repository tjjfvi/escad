
import { Connection } from "./Connection"

/* istanbul ignore next: covered by types, difficult to test */
export const wsConnection = (ws: WebSocket): Connection<string> => ({
  send: msg => ws.send(msg),
  onMsg: cb => ws.addEventListener("message", e => cb(e.data)),
  offMsg: cb => ws.addEventListener("message", e => cb(e.data)),
})
