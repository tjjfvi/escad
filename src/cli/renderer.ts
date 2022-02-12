import { artifactManager, logger } from "../core/mod.ts";
import {
  parentWorkerConnection,
  serializeConnection,
} from "../messages/mod.ts";
import { createRendererServerMessenger } from "../server/renderer.ts";
import { FsArtifactStore } from "./FsArtifactStore.ts";

const artifactsDir = Deno.env.get("ARTIFACTS_DIR");
if (!artifactsDir) {
  throw new Error(
    "Renderer process was not passed environment variable ARTIFACTS_DIR",
  );
}
const loadFile = Deno.env.get("LOAD_FILE");
if (!loadFile) {
  throw new Error(
    "Renderer process was not passed environment variable LOAD_FILE",
  );
}
artifactManager.artifactStores.unshift(new FsArtifactStore(artifactsDir));

createRendererServerMessenger(
  serializeConnection(parentWorkerConnection()),
  () => import(loadFile),
  logger,
);
