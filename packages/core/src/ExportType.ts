import { Product } from "./Product";
import { Id } from "./Id";
import { ExportTypeRegistry } from "./ExportTypeRegistry";
import { ExportManager } from "./ExportManager";
import { SerializeResult } from "tszer";

export interface ExportTypeArgs<P extends Product<P>> {
  id: Id,
  extension: string,
  name: string,
  export: (product: P) => Buffer | SerializeResult,
}

export class ExportType<P extends Product<P>> implements ExportTypeArgs<P> {

  static Registry = new ExportTypeRegistry();

  id: Id;
  extension: string;
  name: string;
  export: (product: P) => Buffer | SerializeResult;
  manager: ExportManager<P>;

  exportBuffer(product: P){
    let result = this.export(product);
    if(result instanceof Buffer)
      return result;
    let buffer = Buffer.alloc(result.length);
    result.write(buffer, 0);
    return buffer;
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
