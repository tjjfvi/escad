
export class MultiMap<K, V> {

  private map = new Map<K, Set<V>>();

  clear(){
    this.map.clear();
  }

  add(key: K, value: V){
    this.getSet(key).add(value);
    return this;
  }

  deleteAll(key: K){
    return this.map.delete(key);
  }

  delete(key: K, value: V){
    return this.getSet(key).delete(value);
  }

  has(key: K, value: V): boolean{
    return this.getSet(key).has(value);
  }

  hasAny(key: K): boolean{
    return !!this.getSet(key).size
  }

  public getAll(key: K): ReadonlySet<V>{
    return this.getSet(key);
  }

  private getSet(key: K): Set<V>{
    const existingSet = this.map.get(key);

    if(existingSet)
      return existingSet;

    const newSet = new Set<V>();
    this.map.set(key, newSet);

    return newSet;
  }

}
