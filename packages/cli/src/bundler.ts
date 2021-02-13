
import { createBundlerServerMessenger } from "@escad/bundler";
import { mapConnection, filterConnection } from "@escad/messages";

if(!process.send)
  throw new Error("Expected to be called in a subprocess with an IPC channel")

const send = process.send.bind(process);

createBundlerServerMessenger(mapConnection.flatted(filterConnection.string({
  send,
  onMsg: cb => process.on("message", cb),
  offMsg: cb => process.off("message", cb),
})));
