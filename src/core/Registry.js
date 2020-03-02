
const Id = require("./Id");

class Registry {

  constructor(name){
    this.name = name;
    this._map = new Map();
  }

  register(entry, id = entry.id){
    if(!(id instanceof Id))
      throw new Error("Registry.register was given invalid key: " + id);
    if(this._map.has(id))
      throw new Error(`Key Conflict: ${id.sha}`);
    this._map.set(id, entry);
  }

  get(id){
    if(!(id instanceof Id))
      throw new Error("Invalid key: " + id);
    if(!this._map.has(id))
      throw new Error(`Missing Entry: ${id.sha}`);
    return this._map.get(id);
  }

}

module.exports = Registry;
