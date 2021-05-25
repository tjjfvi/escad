
import { WeakCache } from "./WeakCache"
import { Hash } from "./Hash"
import { ArtifactStore } from "./ArtifactStore"
import { WrappedValue } from "./WrappedValue"
import { Counter, Timer } from "./Timer"

export class ArtifactManager {

  private excludeStoresCaches = new WeakMap<ReadonlySet<ArtifactStore>, WeakCache<Hash<unknown>, unknown>>()
  private defaultCache = new WeakCache<string, unknown>()

  artifactStores: ArtifactStore[] = []

  timers = Timer.create({
    storeRaw: Timer.create(),
    storeRef: Timer.create(),
    lookupRaw: Timer.create({ calls: Counter.create() }),
    lookupRef: Timer.create({ calls: Counter.create() }),
    getRefCacheKey: Timer.create(),
  })

  async storeRaw<T>(
    artifactPromise: T | Promise<T>,
    excludeStores?: ReadonlySet<ArtifactStore>,
  ){
    const artifact = await artifactPromise

    this.timers.storeRaw.start()
    const artifactHash = Hash.create(artifact)

    this.getCache(excludeStores).set(artifactHash, artifact)

    await Promise.all(this.artifactStores.map(async s => {
      if(!excludeStores?.has(s))
        await s.storeRaw?.(artifactHash, WrappedValue.create(artifact), this)
    }))

    this.timers.storeRaw.end()
    return artifactHash
  }

  async storeRef<T>(
    loc: readonly unknown[],
    artifactPromise: T | Promise<T>,
    excludeStores?: ReadonlySet<ArtifactStore>,
  ){
    this.getCache(excludeStores).setAsync(this.getRefCacheKey(loc), Promise.resolve(artifactPromise))
    const artifact = await artifactPromise

    this.timers.storeRef.start()
    const artifactHash = Hash.create(artifact)

    await Promise.all<unknown>([
      this.storeRaw(artifact, excludeStores),
      ...loc.map(l => this.storeRaw(l, excludeStores)),
      ...this.artifactStores.map(s => {
        if(!excludeStores?.has(s))
          s.storeRef?.(loc, artifactHash, this)
      }),
    ])

    this.timers.storeRef.end()
    return artifactHash
  }

  lookupRaw<T>(
    hash: Hash<T>,
    excludeStores?: ReadonlySet<ArtifactStore>,
  ){
    this.timers.lookupRaw.calls.increment()
    return this.getCache(excludeStores).getAsync(
      hash,
      this.timers.lookupRaw.timeFn(async (): Promise<T | null> => {
        for(const store of this.artifactStores)
          if(!excludeStores?.has(store)) {
            const artifact = await store.lookupRaw?.(hash, this)
            if(artifact && Hash.check(hash, artifact.value))
              return artifact.value
          }
        return null
      }),
    ) as Promise<T | null>
  }

  lookupRef(
    loc: readonly unknown[],
    excludeStores?: ReadonlySet<ArtifactStore>,
  ){
    this.timers.lookupRef.calls.increment()
    return this.getCache(excludeStores).getAsync(
      this.getRefCacheKey(loc),
      this.timers.lookupRef.timeFn(async () => {
        for(const store of this.artifactStores)
          if(!excludeStores?.has(store)) {
            const artifact = await store.lookupRef?.(loc, this)
            if(artifact) {
              await this.storeRaw(artifact.value, excludeStores)
              return artifact.value
            }
          }
        return null
      }),
    )
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

  private getRefCacheKey(loc: readonly unknown[]){
    this.timers.getRefCacheKey.start()
    let key = ""
    for(const part of loc)
      if(typeof part === "string")
        key += part + "//"
      else
        key += Hash.create(part) + "//"
    this.timers.getRefCacheKey.end()
    return key
  }

}

export const artifactManager = new ArtifactManager()
