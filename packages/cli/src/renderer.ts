
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("ts-node").register();

import { filterConnection, mapConnection } from "@escad/messages";
import { createRendererServerMessenger } from "@escad/renderer"

if(!process.send)
  throw new Error("Expected to be called in a subprocess with an IPC channel")

const send = process.send.bind(process);

createRendererServerMessenger(mapConnection.flatted(filterConnection.string({
  send,
  onMsg: cb => process.on("message", cb),
  offMsg: cb => process.off("message", cb),
})));
