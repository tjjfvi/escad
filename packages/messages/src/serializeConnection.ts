
import { Connection, transformConnection } from "."
import { filterConnection } from "./filterConnection"
import flatted from "flatted"

export const serializeConnection = (connection: Connection<string, unknown>): Connection<unknown> =>
  transformConnection(filterConnection.string(connection), flatted.stringify, flatted.parse)
