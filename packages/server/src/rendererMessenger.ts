
import { createMessenger } from "@escad/messages"
import { ServerRendererMessenger } from "@escad/protocol"
import { Connection } from "@escad/messages"

export const createServerRendererMessenger = (connection: Connection<unknown>): ServerRendererMessenger =>
  createMessenger({ impl: {}, connection })
