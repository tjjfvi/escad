
import { ArtifactManager } from "./ArtifactManager"
import { Hash } from "./Hash"

export interface ArtifactStore {
  readonly storeRaw?: (hash: Hash<unknown>, buffer: Buffer, artifactManager: ArtifactManager) => Promise<void>,
  readonly storeRef?: (loc: readonly unknown[], hash: Hash<unknown>, artifactManager: ArtifactManager) => Promise<void>,
  readonly lookupRaw?: (hash: Hash<unknown>, artifactManager: ArtifactManager) => Promise<Buffer | unknown | null>,
  readonly lookupRef?: (loc: readonly unknown[], artifactManager: ArtifactManager) => Promise<Buffer | unknown | null>,
}
