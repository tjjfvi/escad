
import { ArtifactManager } from "./ArtifactManager";
import { Hex } from "./hex";

export type BufferLike = Buffer | string;

export interface ArtifactStore {
  readonly storeRaw?: (hash: Hex, buffer: BufferLike, artifactManager: ArtifactManager) => void,
  readonly storeRef?: (loc: readonly unknown[], hash: Hex, artifactManager: ArtifactManager) => void,
  readonly lookupRaw?: (hash: Hex, artifactManager: ArtifactManager) => Promise<Buffer | unknown | null>,
  readonly lookupRef?: (loc: readonly unknown[], artifactManager: ArtifactManager) => Promise<Buffer | unknown | null>,
}
