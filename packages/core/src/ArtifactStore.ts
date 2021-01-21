
import { ArtifactManager } from "./ArtifactManager";
import { Hash } from "./hash";

export type BufferLike = Buffer | string;

export interface ArtifactStore {
  readonly storeRaw?: (hash: Hash, buffer: BufferLike, artifactManager: ArtifactManager) => void,
  readonly storeRef?: (loc: readonly unknown[], hash: Hash, artifactManager: ArtifactManager) => void,
  readonly lookupRaw?: (hash: Hash, artifactManager: ArtifactManager) => Promise<Buffer | unknown | null>,
  readonly lookupRef?: (loc: readonly unknown[], artifactManager: ArtifactManager) => Promise<Buffer | unknown | null>,
}
