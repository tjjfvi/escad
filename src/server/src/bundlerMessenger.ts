
import { Connection, createMessenger } from "@escad/messages"
import { ServerBundlerMessenger } from "@escad/protocol"

export const createServerBundlerMessenger = (connection: Connection<unknown>): ServerBundlerMessenger =>
  createMessenger({ impl: {}, connection })
