// @flow
/* global WeakRef, FinalizationRegistry, FinalizationGroup */

declare class WeakRef<V> {
  constructor(V): WeakRef<V>;
  deref(): void | V;
}

type F<K, V> = K=>V;
type FA<K, V> = K=>Promise<V>;
class WeakCacheBasic<K, V> {

    #asyncCache: Map<K, Promise<V>>;
    
    constructor(){
      this.#asyncCache = new Map<K, Promise<V>>();
    }

    _get(key: K): ?V{
      key;
      return;
    }

    get(key: K, func: F<K, V>): V{
      return this._get(key) || this.set(key, func);
    }

    async getAsync(key: K, func: FA<K, V>): Promise<V>{
      let val = this._get(key);
      if(val) return val;
      if(this.#asyncCache.has(key))
        // $FlowFixMe
        return await this.#asyncCache.get(key);
      return await this.setAsync(key, func);
    }

    set(key: K, func: F<K, V>): V{
      return func(key);
    }

    async setAsync(key: K, func: FA<K, V>): Promise<V>{
      let prom = (async (): Promise<V> => {
        let val = await func(key);
        this.#asyncCache.delete(key);
        this.set(key, () => val);
        return val;
      })();
      this.#asyncCache.set(key, prom);
      return await prom;
    }

}

let WeakCache;

const FinReg = (
  // $FlowFixMe
  typeof FinalizationRegistry !== "undefined" ?
    FinalizationRegistry :
    // $FlowFixMe
    typeof FinalizationGroup !== "undefined" ?
      FinalizationGroup :
      null
);

// $FlowFixMe
if(WeakRef in global && FinReg)
  WeakCache = class WeakCache<K, V> extends WeakCacheBasic<K, V> {

    #cache: Map<K, WeakRef<V>> = new Map();
    #cleanup;

    constructor(){
      super();
      this.#cleanup = new FinReg(this.#finalize);
    }

    _get(key: K): ?V{
      let ref = this.#cache.get(key);
      if(!ref)
        return;
      const cached = ref.deref();
      return cached;
    }

    #finalize = iterator => {
      for(const key of iterator)
        this.#cache.delete(key);
    }

    set(key: K, func: F<K, V>): V{
      const fresh = func(key);
      if(fresh && typeof fresh === "object") {
        this.#cache.set(key, new WeakRef<V>(fresh));
        this.#cleanup.register(fresh, key);
      }
      return fresh;
    }

  }
else
  WeakCache = WeakCacheBasic;

export default WeakCache;
