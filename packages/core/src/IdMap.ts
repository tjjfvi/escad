
import { Id } from "./Id"

export class IdMap<V> {

  private map = new Map<string, V>()

  set(key: Id, value: V){
    this.map.set(key.full, value)
    return this
  }

  get(key: Id){
    return this.map.get(key.full)
  }

  has(key: Id){
    return this.map.has(key.full)
  }

  clear(){
    this.map.clear()
    return this
  }

  delete(key: Id){
    return this.map.delete(key.full)
  }

  get size(){
    return this.map.size
  }

  values(){
    return this.map.values()
  }

}
