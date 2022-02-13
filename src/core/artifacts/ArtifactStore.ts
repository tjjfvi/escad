import { Hash } from "../utils/mod.ts";
import { ArtifactManager } from "./ArtifactManager.ts";
import { WrappedValue } from "./WrappedValue.ts";

export interface ArtifactStore {
  readonly storeRaw?: (
    hash: Hash<unknown>,
    artifact: WrappedValue,
    artifactManager: ArtifactManager,
  ) => Promise<void>;
  readonly storeRef?: (
    loc: readonly unknown[],
    hash: Hash<unknown>,
    artifactManager: ArtifactManager,
  ) => Promise<void>;
  readonly lookupRaw?: (
    hash: Hash<unknown>,
    artifactManager: ArtifactManager,
  ) => Promise<WrappedValue | null>;
  readonly lookupRef?: (
    loc: readonly unknown[],
    artifactManager: ArtifactManager,
  ) => Promise<WrappedValue | null>;
}
