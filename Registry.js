
class Registry {

  constructor(name){
    this.name = name;
    this._map = new Map();
  }

  register(entry, key = entry.id){
    if(this._map.has(key))
      throw new Error(`Key Conflict: ${JSON.stringify(key)}`);
    this._map.set(key, entry);
  }

  get(key){
    if(!this._map.has(key))
      throw new Error(`Missing Entry: ${JSON.stringify(key)}`);
    return this._map.get(key);
  }

}

module.exports = Registry;
