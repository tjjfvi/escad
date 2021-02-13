
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("ts-node").register();

import { filterConnection, mapConnection, parentProcessConnection } from "@escad/messages";
import { createRendererServerMessenger } from "@escad/renderer"

createRendererServerMessenger(
  mapConnection.flatted(filterConnection.string(parentProcessConnection()))
);
