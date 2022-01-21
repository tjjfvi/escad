
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("ts-node").register()

import { artifactManager, logger } from "../core/mod.ts"
import { parentProcessConnection, serializeConnection } from "../messages/mod.ts"
import { createRendererServerMessenger } from "../renderer/mod.ts"
import { FsArtifactStore } from "./FsArtifactStore.ts"

const artifactsDir = process.env.ARTIFACTS_DIR
if(!artifactsDir) throw new Error("Renderer process was not passed environment variable ARTIFACTS_DIR")
const loadFile = process.env.LOAD_FILE
if(!loadFile) throw new Error("Renderer process was not passed environment variable LOAD_FILE")
artifactManager.artifactStores.unshift(new FsArtifactStore(artifactsDir))

createRendererServerMessenger(serializeConnection(parentProcessConnection()), () => require(loadFile), logger)
