
import "@escad/core" // register serializers, needed for talking to renderer

import { createMessenger } from "../messages/mod.ts"
import { ServerRendererMessenger, ServerRendererShape } from "../protocol/mod.ts"
import { Connection } from "../messages/mod.ts"

export const createServerRendererMessenger = (
  lookupRaw: ServerRendererShape["lookupRaw"],
  connection: Connection<unknown>,
): ServerRendererMessenger =>
  createMessenger({ impl: { lookupRaw }, connection })
