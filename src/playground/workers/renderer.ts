import { artifactManager, ArtifactStore, logger } from "../core/mod.ts";
import {
  brandConnection,
  createMessenger,
  workerConnection,
} from "../messages/mod.ts";
import { createRendererServerMessenger } from "../renderer/mod.ts";

const artifactMessenger = createMessenger<{}, Required<ArtifactStore>, {}>({
  impl: {},
  connection: brandConnection(workerConnection(self as any), "artifacts"),
});

// Prevent sending non-serializable ArtifactManager
artifactManager.artifactStores.unshift({
  storeRaw: (hash, buffer) =>
    artifactMessenger.storeRaw(hash, buffer, null as never),
  storeRef: (loc, buffer) =>
    artifactMessenger.storeRef(loc, buffer, null as never),
  lookupRaw: (loc) => artifactMessenger.lookupRaw(loc, null as never),
  lookupRef: (hash) => artifactMessenger.lookupRef(hash, null as never),
});

createRendererServerMessenger(
  brandConnection(workerConnection(self as any), "renderer"),
  () => require("/project/index.js"),
  logger,
);
