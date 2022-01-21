
import { HashMap } from "./HashMap"
import { HashSet } from "./HashSet"

export class MultiHashMap<K, V> {

  private map = new HashMap<K, HashSet<V>>()

  clear(){
    this.map.clear()
  }

  add(key: K, value: V){
    this.getSet(key).add(value)
    return this
  }

  deleteAll(key: K){
    return this.map.delete(key)
  }

  delete(key: K, value: V){
    return this.getSet(key).delete(value)
  }

  has(key: K, value: V): boolean{
    return this.getSet(key).has(value)
  }

  hasAny(key: K): boolean{
    return !!this.getSet(key).size
  }

  getAll(key: K): Iterable<V>{
    return this.getSet(key)
  }

  private getSet(key: K): HashSet<V>{
    const existingSet = this.map.get(key)

    if(existingSet)
      return existingSet

    const newSet = new HashSet<V>()
    this.map.set(key, newSet)

    return newSet
  }

  *values(){
    for(const set of this.map.values())
      yield* set
  }

}
