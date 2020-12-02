
import { Hex } from "./hex";

export type BufferLike = Buffer | string;

export interface ArtifactStore {
  readonly storeRaw?: (hash: Hex, buffer: BufferLike) => void,
  readonly storeRef?: (loc: readonly unknown[], hash: Hex) => void,
  readonly lookupRaw?: (hash: Hex) => Promise<Buffer | unknown | null>,
  readonly lookupRef?: (loc: readonly unknown[]) => Promise<Buffer | unknown | null>,
}
