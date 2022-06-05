import { Counter, Hash, Timer, WeakCache } from "../utils/mod.ts";
import { ArtifactStore } from "./ArtifactStore.ts";
import { WrappedValue } from "./WrappedValue.ts";

export class ArtifactManager {
  private excludeStoresCaches = new WeakMap<
    ReadonlySet<ArtifactStore>,
    WeakCache<Hash<unknown>, WrappedValue | null>
  >();
  private defaultCache = new WeakCache<string, WrappedValue | null>();

  artifactStores: ArtifactStore[] = [];

  timers = Timer.create({
    storeRaw: Timer.create(),
    storeRef: Timer.create(),
    lookupRaw: Timer.create({ calls: Counter.create() }),
    lookupRef: Timer.create({ calls: Counter.create() }),
    getRefCacheKey: Timer.create(),
  });

  async storeRaw<T>(
    artifactPromise: T | Promise<T>,
    excludeStores?: ReadonlySet<ArtifactStore>,
  ) {
    const artifact = await artifactPromise;

    const artifactHash = Hash.create(artifact);

    const cache = this.getCache(excludeStores);
    await cache.getAsync(this.getWriteCacheKey(artifactHash), async () => {
      this.timers.storeRaw.start();

      cache.set(
        artifactHash,
        WrappedValue.create(artifact),
      );

      await Promise.all(this.artifactStores.map(async (s) => {
        if (!excludeStores?.has(s)) {
          await s.storeRaw?.(artifactHash, WrappedValue.create(artifact), this);
        }
      }));

      this.timers.storeRaw.end();

      return null;
    });

    return artifactHash;
  }

  async storeRef<T>(
    loc: readonly unknown[],
    artifactPromise: T | Promise<T>,
    excludeStores?: ReadonlySet<ArtifactStore>,
  ) {
    const cache = this.getCache(excludeStores);
    const cacheKey = this.getRefCacheKey(loc);
    let artifactHash: Hash<T>;
    await cache.getAsync(this.getWriteCacheKey(cacheKey), async () => {
      cache.setAsync(
        cacheKey,
        Promise.resolve(artifactPromise).then(WrappedValue.create),
      );
      const artifact = await artifactPromise;

      artifactHash = Hash.create(artifact);

      this.timers.storeRef.start();

      await cache.setAsync(
        this.getWriteCacheKey(cacheKey),
        Promise.all<unknown>([
          this.storeRaw(artifact, excludeStores),
          ...loc.map((l) => this.storeRaw(l, excludeStores)),
          ...this.artifactStores.map((s) => {
            if (!excludeStores?.has(s)) {
              s.storeRef?.(loc, artifactHash, this);
            }
          }),
        ]).then(() => null),
      );

      this.timers.storeRef.end();

      return null;
    });
    return artifactHash! ?? Hash.create(await artifactPromise);
  }

  async lookupRaw<T>(
    hash: Hash<T>,
    excludeStores?: ReadonlySet<ArtifactStore>,
  ) {
    const result = await this.lookupRawWrapped(hash, excludeStores);
    if (result) return result.value;
    return null;
  }

  lookupRawWrapped<T>(
    hash: Hash<T>,
    excludeStores?: ReadonlySet<ArtifactStore>,
  ) {
    this.timers.lookupRaw.calls.increment();
    return this.getCache(excludeStores).getAsync(
      hash,
      this.timers.lookupRaw.timeFn(
        async (): Promise<WrappedValue<T> | null> => {
          for (const store of this.artifactStores) {
            if (!excludeStores?.has(store)) {
              const artifact = await store.lookupRaw?.(hash, this);
              if (artifact && Hash.check(hash, artifact.value)) {
                return artifact as WrappedValue<T>;
              }
            }
          }
          return null;
        },
      ),
    ) as Promise<WrappedValue<T> | null>;
  }

  async lookupRef(
    loc: readonly unknown[],
    excludeStores?: ReadonlySet<ArtifactStore>,
  ) {
    const result = await this.lookupRefWrapped(loc, excludeStores);
    if (result) return result.value;
    return null;
  }

  lookupRefWrapped(
    loc: readonly unknown[],
    excludeStores?: ReadonlySet<ArtifactStore>,
  ): Promise<WrappedValue | null> {
    this.timers.lookupRef.calls.increment();
    return this.getCache(excludeStores).getAsync(
      this.getRefCacheKey(loc),
      this.timers.lookupRef.timeFn(async () => {
        for (const store of this.artifactStores) {
          if (!excludeStores?.has(store)) {
            const artifact = await store.lookupRef?.(loc, this);
            if (artifact) {
              await this.storeRaw(artifact.value, excludeStores);
              return artifact;
            }
          }
        }
        return null;
      }),
    );
  }

  async computeRef<T>(
    loc: readonly unknown[],
    func: () => Promise<T>,
    excludeStores?: ReadonlySet<ArtifactStore>,
  ) {
    const stored = await this.lookupRefWrapped(loc, excludeStores);
    if (stored) return stored.value as T;
    const result = func();
    this.storeRef(loc, result, excludeStores);
    return await result;
  }

  private getCache(excludeStores?: ReadonlySet<ArtifactStore>) {
    if (!excludeStores?.size) {
      return this.defaultCache;
    }
    const existing = this.excludeStoresCaches.get(excludeStores);
    if (existing) return existing;
    const cache = new WeakCache<Hash<unknown>, WrappedValue>();
    this.excludeStoresCaches.set(excludeStores, cache);
    return cache;
  }

  private getRefCacheKey(loc: readonly unknown[]) {
    this.timers.getRefCacheKey.start();
    let key = "";
    for (const part of loc) {
      if (typeof part === "string") {
        key += part + "//";
      } else {
        key += Hash.create(part) + "//";
      }
    }
    this.timers.getRefCacheKey.end();
    return key;
  }

  private getWriteCacheKey(key: string) {
    return "~" + key;
  }
}

export const artifactManager = new ArtifactManager();
