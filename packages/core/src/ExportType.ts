import { Product } from "./Product";
import { Id } from "./Id";
import { ExportTypeRegistry } from "./ExportTypeRegistry";
import { ExportManager } from "./ExportManager";
import { SerializeFunc, Serializer } from "tszer";

export interface ExportTypeArgs<P extends Product<P>> {
  id: Id,
  extension: string,
  name: string,
  export: SerializeFunc<P>,
}

export class ExportType<P extends Product<P>> implements ExportTypeArgs<P> {

  static Registry = new ExportTypeRegistry();

  id: Id;
  extension: string;
  name: string;
  export: SerializeFunc<P>
  manager: ExportManager<P>;

  exportStream(product: P){
    return Serializer.serialize(new Serializer({
      serialize: this.export,
      deserialize: null as any,
    }), product);
  }

  constructor({ id, extension, name, export: exportFunc }: ExportTypeArgs<P>){
    if(!extension.startsWith("."))
      extension = "." + extension;

    this.id = id;
    this.name = name;
    this.export = exportFunc;
    this.extension = extension;
    this.manager = new ExportManager(this);
  }

}
