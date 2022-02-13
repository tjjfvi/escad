/* eslint-disable @typescript-eslint/ban-types */

if (typeof WeakRef === "undefined") {
  throw new Error("The environment does not support WeakRef");
}

export class WeakCache<K, V> {
  private cache = new Map<K, WeakRef<V & object>>();
  private asyncCache = new Map<K, Promise<V>>();
  private finalizationRegistry = new FinalizationRegistry<K>((key) => {
    this.cache.delete(key);
  });

  get(key: K, func: (key: K) => V): V {
    const value = this.cache.get(key)?.deref();
    if (value === undefined) {
      return this.set(key, func(key));
    }
    return value;
  }

  getAsync(key: K, func: (key: K) => Promise<V>): Promise<V> {
    const cachedValue = this.cache.get(key)?.deref();
    if (cachedValue !== undefined) {
      return Promise.resolve(cachedValue);
    }
    const asyncCachedValue = this.asyncCache.get(key);
    if (asyncCachedValue !== undefined) {
      return asyncCachedValue;
    }
    return this.setAsync(key, func(key));
  }

  set(key: K, value: V): V {
    if (value && typeof value === "object") {
      this.cache.set(key, new WeakRef(value as V & object));
      this.finalizationRegistry.register(value as V & object, key);
    }
    return value;
  }

  setAsync(key: K, promise: Promise<V>): Promise<V> {
    const thennedPromise = promise.then((value) => {
      this.asyncCache.delete(key);
      this.set(key, value);
      return value;
    });
    this.asyncCache.set(key, thennedPromise);
    return thennedPromise;
  }
}
