
import { createBundlerServerMessenger } from "@escad/bundler";
import { mapConnection, filterConnection, parentProcessConnection } from "@escad/messages";

createBundlerServerMessenger(
  mapConnection.flatted(filterConnection.string(parentProcessConnection()))
);
