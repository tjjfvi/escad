
import { Hash } from "./Hash"

export class HashMap<K, V> {

  private map = new Map<Hash<K>, V>();

  set(key: K, value: V){
    this.map.set(Hash.create(key), value)
    return this
  }

  get(key: K){
    return this.map.get(Hash.create(key))
  }

  has(key: K){
    return this.map.has(Hash.create(key))
  }

  clear(){
    this.map.clear()
    return this
  }

  delete(key: K){
    return this.map.delete(Hash.create(key))
  }

  get size(){
    return this.map.size
  }

  values(){
    return this.map.values()
  }

}
