import { instanceId } from "./instanceId.ts";
import { putVfs } from "./vfs.ts";
import { transpiler } from "./transpiler.ts";

export async function getRendererWorkerUrl(): Promise<string> {
  await putVfs(
    `${instanceId}/renderer.ts`,
    `
import { artifactManager, ArtifactStore, logger } from "/core/mod.ts";
import {
  createMessenger,
  workerConnection,
  serializeConnection,
  logConnection,
} from "/messages/mod.ts";
import { createRendererServerMessenger } from "/renderer/mod.ts";
import { VfsArtifactStore } from "/playground/VfsArtifactStore.ts";

artifactManager.artifactStores.unshift(new VfsArtifactStore());

createRendererServerMessenger(
  logConnection(serializeConnection(workerConnection(self as any))),
  () => import(${
      JSON.stringify(
        `/vfs/${new URL(`/vfs/${instanceId}/main.ts`, import.meta.url)}`,
      )
    })
  logger,
).requestRetry();
`,
  );

  let rendererUrl = new URL(`/vfs/${instanceId}/renderer.ts`, import.meta.url)
    .toString();
  await transpiler.transpile(rendererUrl, false);

  return `/vfs/${rendererUrl}`;
}
