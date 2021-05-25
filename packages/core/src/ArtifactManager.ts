
import { WeakCache } from "./WeakCache"
import { Hash } from "./Hash"
import { ArtifactStore } from "./ArtifactStore"
import { WrappedValue } from "./WrappedValue"

export class ArtifactManager {

  private excludeStoresCaches = new WeakMap<ReadonlySet<ArtifactStore>, WeakCache<Hash<unknown>, unknown>>()
  private defaultCache = new WeakCache<Hash<unknown>, unknown>()

  artifactStores: ArtifactStore[] = []

  async storeRaw<T>(
    artifactPromise: T | Promise<T>,
    excludeStores?: ReadonlySet<ArtifactStore>,
  ){
    const artifact = await artifactPromise
    const artifactHash = Hash.create(artifact)

    this.getCache(excludeStores).set(artifactHash, artifact)

    await Promise.all(this.artifactStores.map(async s => {
      if(!excludeStores?.has(s))
        await s.storeRaw?.(artifactHash, WrappedValue.create(artifact), this)
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

    await Promise.all<unknown>([
      this.storeRaw(artifact, excludeStores),
      ...loc.map(l => this.storeRaw(l, excludeStores)),
      ...this.artifactStores.map(s => {
        if(!excludeStores?.has(s))
          s.storeRef?.(loc, artifactHash, this)
      }),
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
          const artifact = await store.lookupRaw?.(hash, this)
          if(artifact && Hash.check(hash, artifact.value))
            return artifact.value
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
          const artifact = await store.lookupRef?.(loc, this)
          if(artifact) {
            await this.storeRaw(artifact.value, excludeStores)
            return artifact.value
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
