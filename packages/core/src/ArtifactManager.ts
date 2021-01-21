
import { WeakCache } from "./WeakCache";
import { Hash, hash } from "./hash";
import { ArtifactStore, BufferLike } from "./ArtifactStore";

export type SerializeFunc<T> = (artifact: T) => BufferLike;
export type DeserializeFunc<T> = (buffer: Buffer) => T;

export class ArtifactManager {

  private cache = new WeakCache<unknown, unknown>()

  artifactStores: ArtifactStore[] = [];

  private serialize(artifact: unknown): Buffer{
    return artifact instanceof Buffer ? artifact : Buffer.from(JSON.stringify(artifact));
  }

  private deserialize(buffer: unknown): unknown{
    if(!(buffer instanceof Buffer)) return buffer;
    try {
      return JSON.parse(buffer.toString("utf8"));
    } catch (e) {
      return buffer;
    }
  }

  async storeRaw<T>(
    artifactPromise: T | Promise<T>,
    excludeStores?: ReadonlySet<ArtifactStore>,
  ){
    const artifact = await artifactPromise;
    const artifactHash = hash(artifact);

    this.cache.set(artifactHash, () => artifact);

    let serialized;
    await Promise.all(this.artifactStores.map(s =>
      !excludeStores?.has(s) && s.storeRaw?.(artifactHash, serialized ??= this.serialize(artifact), this)
    ));

    return artifact;
  }

  async storeRef<T>(
    loc: readonly unknown[],
    artifactPromise: T | Promise<T>,
    excludeStores?: ReadonlySet<ArtifactStore>,
  ){
    const artifact = await artifactPromise;
    const artifactHash = hash(artifact);

    this.cache.set(loc, () => artifact);

    await Promise.all<any>([
      this.storeRaw(artifact, excludeStores),
      ...loc.map(l => this.storeRaw(l, excludeStores)),
      ...this.artifactStores.map(s =>
        !excludeStores?.has(s) && s.storeRef?.(loc, artifactHash, this)
      ),
    ]);

    return artifact;
  }

  async lookupRaw(
    hash: Hash,
    excludeStores?: ReadonlySet<ArtifactStore>,
  ){
    for(const store of this.artifactStores)
      if(!excludeStores?.has(store)) {
        const buffer = await store.lookupRaw?.(hash, this);
        if(buffer)
          return this.deserialize(buffer);
      }
    return null;
  }

  async lookupRef(
    loc: readonly unknown[],
    excludeStores?: ReadonlySet<ArtifactStore>,
  ){
    for(const store of this.artifactStores)
      if(!excludeStores?.has(store)) {
        const buffer = await store.lookupRef?.(loc, this);
        if(buffer) {
          const artifact = this.deserialize(buffer);
          await this.storeRaw(artifact, excludeStores);
          return this.deserialize(buffer);
        }
      }
    return null;
  }

}

export const artifactManager = new ArtifactManager();
