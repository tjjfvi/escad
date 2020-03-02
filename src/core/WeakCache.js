/* global WeakRef, FinalizationRegistry, FinalizationGroup */

let WeakCache;

let FinReg = (
  typeof FinalizationRegistry !== "undefined" ?
    FinalizationRegistry :
    typeof FinalizationGroup !== "undefined" ?
      FinalizationGroup :
      null
);

if(typeof WeakRef !== "undefined" && FinReg)
  WeakCache = class WeakCache {

    #cache = new Map();
    #cleanup;

    constructor(){
      this.#cleanup = new FinReg(this.#finalize);
    }

    #finalize = iterator => {
      for(const key of iterator) {
        const ref = this.#cache.get(key);
        if(!ref && ref.deref() === undefined)
          this.#cache.delete(key);
      }
    }

    get(key, func){
      const ref = this.#cache.get(key);
      if(ref) {
        const cached = ref.deref();
        if(cached !== undefined)
          return cached;
      }
      return this.set(key, func);
    }

    async getAsync(key, func){
      return await this.get(key, func);
    }

    set(key, func){
      const fresh = func(key);
      this.#cache.set(key, new WeakRef(fresh));
      this.#cleanup.register(fresh, key);
      return fresh;
    }

    async setAsync(key, func){
      return await this.set(key, func);
    }

  }
else
  WeakCache = class WeakCacheBasic {

    #map = new Map();

    get(key, func){
      return func(key);
    }

    set(key, func){
      return func(key);
    }

    async getAsync(key, func){
      if(this.#map.has(key))
        return await this.#map.get(key);
      return await this.setAsync(key, func);
    }

    async setAsync(key, func){
      let prom = (async () => {
        let val = await func(key);
        this.#map.delete(key);
        return val;
      })();
      this.#map.set(key, prom);
      return await prom;
    }

  }

module.exports = WeakCache;
