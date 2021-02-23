
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("ts-node").register();

import { parentProcessConnection } from "@escad/messages";
import { createRendererServerMessenger } from "@escad/renderer"

createRendererServerMessenger(parentProcessConnection());
