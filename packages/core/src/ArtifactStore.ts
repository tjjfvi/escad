
import { ArtifactManager } from "./ArtifactManager";
import { Hash } from "./Hash";

export type BufferLike = Buffer | string;

export interface ArtifactStore {
  readonly storeRaw?: (hash: Hash<unknown>, buffer: BufferLike, artifactManager: ArtifactManager) => void,
  readonly storeRef?: (loc: readonly unknown[], hash: Hash<unknown>, artifactManager: ArtifactManager) => void,
  readonly lookupRaw?: (hash: Hash<unknown>, artifactManager: ArtifactManager) => Promise<Buffer | unknown | null>,
  readonly lookupRef?: (loc: readonly unknown[], artifactManager: ArtifactManager) => Promise<Buffer | unknown | null>,
}
