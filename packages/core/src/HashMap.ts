
import { hash, Hash } from "./hash";

export class HashMap<K, V> {

  private map = new Map<Hash<K>, V>();

  set(key: K, value: V){
    this.map.set(hash(key), value);
    return this
  }

  get(key: K){
    return this.map.get(hash(key))
  }

  has(key: K){
    return this.map.has(hash(key))
  }

  clear(){
    this.map.clear();
  }

  delete(key: K){
    return this.map.delete(hash(key))
  }

  get size(){
    return this.map.size;
  }

  values(){
    return this.map.values();
  }

}
