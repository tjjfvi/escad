
import { HashMap } from "./HashMap.ts"

export class HashSet<T> {

  private map = new HashMap<T, T>()

  add(value: T){
    this.map.set(value, value)
    return this
  }

  has(value: T){
    return this.map.has(value)
  }

  clear(){
    this.map.clear()
    return this
  }

  delete(value: T){
    return this.map.delete(value)
  }

  get size(){
    return this.map.size
  }

  values(){
    return this.map.values()
  }

  [Symbol.iterator](){
    return this.map.values()
  }

}
