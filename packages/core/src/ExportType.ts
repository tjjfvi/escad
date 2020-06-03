import { Product } from "./Product";
import { Id } from "./Id";
import { ExportTypeRegistry } from "./ExportTypeRegistry";

export interface ExportTypeArgs<P extends Product<P>> {
  id: Id,
  extension: string,
  name: string,
  export: (product: P) => Buffer,
}

export class ExportType<P extends Product<P>> implements ExportTypeArgs<P> {

  static Registry = new ExportTypeRegistry();

  id: Id;
  extension: string;
  name: string;
  export: (product: P) => Buffer;

  constructor({ id, extension, name, export: exportFunc, }: ExportTypeArgs<P>) {
    if (!extension.startsWith("."))
      extension = "." + extension;

    this.id = id;
    this.name = name;
    this.export = exportFunc;
    this.extension = extension;
  }

}