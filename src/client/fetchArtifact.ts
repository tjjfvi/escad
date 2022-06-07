import { Accessor, createResource } from "../deps/solid.ts";
import { ArtifactManager, Hash } from "../core/mod.ts";

export function fetchArtifact<T>(
  artifactManager: ArtifactManager,
  hash: Accessor<Hash<T> | null>,
) {
  const [artifact] = createResource(hash, async (hash) => {
    if (!hash) return null;
    return artifactManager.lookupRaw(hash);
  });
  return artifact;
}
