import { Connection } from "./Connection"
import { transformConnection } from "./transformConnection"

/* istanbul ignore next: covered by types, noisy to test */
export const logConnection = <T>(connection: Connection<T>): Connection<T> =>
  transformConnection(
    connection,
    value => {
      console.log("send", ...([] as unknown[]).concat(value))
      return value
    },
    value => {
      console.log("recb", ...([] as unknown[]).concat(value))
      return value
    },
  )
