
import Id from "./Id";

class Registry<T> {

  name: string;
  private map = new Map<Id, T>();

  constructor(name: string) {
    this.name = name;
  }

  register(entry: T & { id: Id }): void
  register(entry: T, id: Id): void
  // @ts-ignore
  register(entry: T, id: Id = entry.id) {
    if (!(id instanceof Id))
      throw new Error("Registry.register was given invalid key: " + id);
    if (this.map.has(id))
      throw new Error(`Key Conflict: ${id.sha.b64}`);
    this.map.set(id, entry);
  }

  get(id: Id): T {
    if (!(id instanceof Id))
      throw new Error("Invalid key: " + id);
    if (!this.map.has(id))
      throw new Error(`Missing Entry: ${id.sha.b64}`);
    // @ts-ignore
    return this.map.get(id);
  }

}

export default Registry;
