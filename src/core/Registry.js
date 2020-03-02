
const Id = require("./Id");

class Registry {

  name;
  #map = new Map();

  constructor(name){
    this.name = name;
  }

  register(entry, id = entry.id){
    if(!(id instanceof Id))
      throw new Error("Registry.register was given invalid key: " + id);
    if(this.#map.has(id))
      throw new Error(`Key Conflict: ${id.sha}`);
    this.#map.set(id, entry);
  }

  get(id){
    if(!(id instanceof Id))
      throw new Error("Invalid key: " + id);
    if(!this.#map.has(id))
      throw new Error(`Missing Entry: ${id.sha}`);
    return this.#map.get(id);
  }

}

module.exports = Registry;
