
export class DeepMap<K1, K2, V> {

  private map = new Map<K1, Map<K2, V>>();

  clear(){
    this.map.clear();
  }

  set(key1: K1, key2: K2, value: V){
    this.getMap(key1).set(key2, value);
    return this;
  }

  delete(key1: K1, key2: K2){
    return this.getMap(key1).delete(key2);
  }

  get(key1: K1, key2: K2): V | undefined{
    return this.getMap(key1).get(key2);
  }

  getAll(key1: K1): ReadonlyMap<K2, V>{
    return this.getMap(key1);
  }

  has(key1: K1, key2: K2): boolean{
    return this.getMap(key1).has(key2);
  }

  hasAny(key1: K1): boolean{
    return !!this.getMap(key1).size
  }

  private getMap(key1: K1): Map<K2, V>{
    const existingMap = this.map.get(key1);

    if(existingMap)
      return existingMap;

    const newMap = new Map<K2, V>();
    this.map.set(key1, newMap);

    return newMap;
  }

}
