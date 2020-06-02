/* global WeakRef, FinalizationRegistry, FinalizationGroup */

declare class WeakRef<V> {
  constructor(v: V);
  deref(): void | V;
}

type F<K, V> = (k: K) => V;
type FA<K, V> = (k: K) => Promise<V>;

export class WeakCacheBasic<K, V> {

  private asyncCache: Map<K, Promise<V>>;

  protected static readonly notFound = Symbol();
  protected readonly notFound: typeof WeakCacheBasic.notFound = WeakCacheBasic.notFound;

  constructor() {
    this.asyncCache = new Map<K, Promise<V>>();
  }

  _get(key: K): V | typeof WeakCacheBasic.notFound {
    key;
    return this.notFound;
  }

  get(key: K, func: F<K, V>): V {
    let v = this._get(key);
    if (v === this.notFound)
      return this.set(key, func);
    return v;
  }

  async getAsync(key: K, func: FA<K, V>): Promise<V> {
    let val = this._get(key);
    if (val !== this.notFound)
      return val;
    if (this.asyncCache.has(key))
      // @ts-ignore
      return await this.asyncCache.get(key);
    return await this.setAsync(key, func);
  }

  set(key: K, func: F<K, V>): V {
    return func(key);
  }

  async setAsync(key: K, func: FA<K, V>): Promise<V> {
    let prom = (async (): Promise<V> => {
      let val = await func(key);
      this.asyncCache.delete(key);
      this.set(key, () => val);
      return val;
    })();
    this.asyncCache.set(key, prom);
    return await prom;
  }

}

export let WeakCache = WeakCacheBasic;

const FinReg = (
  // @ts-ignore
  typeof FinalizationRegistry !== "undefined" ?
    // @ts-ignore
    FinalizationRegistry :
    // @ts-ignore
    typeof FinalizationGroup !== "undefined" ?
      // @ts-ignore
      FinalizationGroup :
      null
);

// @ts-ignore
if ("WeakRef" in global && FinReg)
  WeakCache = class WeakCache<K, V> extends WeakCacheBasic<K, V> {

    private cache: Map<K, WeakRef<V>> = new Map();
    private cleanup: any;

    constructor() {
      super();
      this.cleanup = new FinReg(this.finalize);
    }

    _get(key: K) {
      let ref = this.cache.get(key);
      if (!ref)
        return this.notFound;
      const cached = ref.deref();
      return cached === undefined ? this.notFound : (cached as V);
    }

    private finalize = (iterator: Iterable<K>) => {
      // @ts-ignore
      for (const key of iterator)
        this.cache.delete(key);
    }

    set(key: K, func: F<K, V>): V {
      const fresh = func(key);
      if (fresh && typeof fresh === "object") {
        this.cache.set(key, new WeakRef<V>(fresh));
        this.cleanup.register(fresh, key);
      }
      return fresh;
    }

  }
