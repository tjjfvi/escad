
importScripts(location.origin + "/bundled/dynamicWorkerSetup.worker.js");

import { workerConnection, brandConnection } from "@escad/messages";
import { createRendererServerMessenger } from "@escad/renderer"

createRendererServerMessenger(
  brandConnection(workerConnection(self as any), "renderer"),
  () => require("/project/index.ts"),
);
