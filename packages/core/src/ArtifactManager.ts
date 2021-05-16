
import { WeakCache } from "./WeakCache"
import { Hash } from "./Hash"
import { ArtifactStore } from "./ArtifactStore"
import { timers } from "./Timer"

export class ArtifactManager {

  private excludeStoresCaches = new WeakMap<ReadonlySet<ArtifactStore>, WeakCache<Hash<unknown>, unknown>>()
  private defaultCache = new WeakCache<Hash<unknown>, unknown>()

  artifactStores: ArtifactStore[] = []

  private serialize(artifact: unknown): Buffer{
    return artifact instanceof Buffer
      ? artifact
      : Buffer.from(timers.stringifySerialize.time(JSON.stringify)(artifact))
  }

  private deserialize(buffer: unknown): unknown{
    if(!(buffer instanceof Buffer)) return buffer
    try {
      return JSON.parse(buffer.toString("utf8"))
    }
    catch (e) {
      return buffer
    }
  }

  async storeRaw<T>(
    artifactPromise: T | Promise<T>,
    excludeStores?: ReadonlySet<ArtifactStore>,
  ){
    const artifact = await artifactPromise
    const artifactHash = Hash.create(artifact)

    this.getCache(excludeStores).set(artifactHash, artifact)

    let serialized
    await Promise.all(this.artifactStores.map(s => {
      if(!excludeStores?.has(s))
        return s.storeRaw?.(artifactHash, serialized ??= this.serialize(artifact), this)
    }))

    return artifactHash
  }

  async storeRef<T>(
    loc: readonly unknown[],
    artifactPromise: T | Promise<T>,
    excludeStores?: ReadonlySet<ArtifactStore>,
  ){
    this.getCache(excludeStores).setAsync(Hash.create(loc), Promise.resolve(artifactPromise))

    const artifact = await artifactPromise
    const artifactHash = Hash.create(artifact)

    await Promise.all<any>([
      this.storeRaw(artifact, excludeStores),
      ...loc.map(l => this.storeRaw(l, excludeStores)),
      ...this.artifactStores.map(s =>
        !excludeStores?.has(s) && s.storeRef?.(loc, artifactHash, this),
      ),
    ])

    return artifactHash
  }

  lookupRaw<T>(
    hash: Hash<T>,
    excludeStores?: ReadonlySet<ArtifactStore>,
  ){
    return this.getCache(excludeStores).getAsync(hash, async (): Promise<T | null> => {
      for(const store of this.artifactStores)
        if(!excludeStores?.has(store)) {
          const buffer = await store.lookupRaw?.(hash, this)
          if(!buffer) continue
          const artifact = this.deserialize(buffer)
          if(Hash.check(hash, artifact))
            return artifact
        }
      return null
    }) as Promise<T | null>
  }

  lookupRef(
    loc: readonly unknown[],
    excludeStores?: ReadonlySet<ArtifactStore>,
  ){
    return this.getCache(excludeStores).getAsync(Hash.create(loc), async () => {
      for(const store of this.artifactStores)
        if(!excludeStores?.has(store)) {
          const buffer = await store.lookupRef?.(loc, this)
          if(buffer) {
            const artifact = this.deserialize(buffer)
            await this.storeRaw(artifact, excludeStores)
            return artifact
          }
        }
      return null
    })
  }

  private getCache(excludeStores?: ReadonlySet<ArtifactStore>){
    if(!excludeStores?.size)
      return this.defaultCache
    const existing = this.excludeStoresCaches.get(excludeStores)
    if(existing) return existing
    const cache = new WeakCache<Hash<unknown>, unknown>()
    this.excludeStoresCaches.set(excludeStores, cache)
    return cache
  }

}

export const artifactManager = new ArtifactManager()
