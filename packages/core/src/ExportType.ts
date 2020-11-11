import { Id } from "./Id";
// import { ExportTypeRegistry } from "./ExportTypeRegistry";
import { ExportManager } from "./ExportManager";
import { Product, ProductType } from "./Product";

export interface ExportTypeArgs<P extends Product> {
  id: Id,
  productType: ProductType<P>,
  extension: string,
  name: string,
  export: (value: P) => string | Buffer,
}

export class ExportType<P extends Product> implements ExportTypeArgs<P> {

  // static Registry = new ExportTypeRegistry();

  id: Id;
  productType: ProductType<P>;
  extension: string;
  name: string;
  export: (value: P) => string | Buffer;
  manager: ExportManager<P>;

  constructor({ id, extension, name, export: exportFunc, productType }: ExportTypeArgs<P>){
    if(!extension.startsWith("."))
      extension = "." + extension;

    this.id = id;
    this.name = name;
    this.export = exportFunc;
    this.extension = extension;
    this.productType = productType;
    this.manager = new ExportManager<P>(this);
  }

}
