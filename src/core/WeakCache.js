/* global WeakRef, FinalizationRegistry, FinalizationGroup */

class WeakCacheBasic {

    #asyncCache = new Map();

    _get(){
      return;
    }

    get(key, func){
      return this._get(key) || this.set(key, func);
    }

    async getAsync(key, func){
      let val = this._get(key);
      if(val) return val;
      if(this.#asyncCache.has(key))
        return await this.#asyncCache.get(key);
      return await this.setAsync(key, func);
    }

    set(key, func){
      return func(key);
    }

    async setAsync(key, func){
      let prom = (async () => {
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
  typeof FinalizationRegistry !== "undefined" ?
    FinalizationRegistry :
    typeof FinalizationGroup !== "undefined" ?
      FinalizationGroup :
      null
);

if(typeof WeakRef !== "undefined" && FinReg)
  WeakCache = class extends WeakCacheBasic {

    #cache = new Map();
    #cleanup;

    constructor(){
      super();
      this.#cleanup = new FinReg(this.#finalize);
    }

    _get(key){
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

    set(key, func){
      const fresh = func(key);
      if(fresh && typeof fresh === "object") {
        this.#cache.set(key, new WeakRef(fresh));
        this.#cleanup.register(fresh, key);
      }
      return fresh;
    }

  }
else
  WeakCache = WeakCacheBasic;

export default WeakCache;
