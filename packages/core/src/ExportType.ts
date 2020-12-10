import { ArtifactStore } from "./ArtifactStore";
import { Id } from "./Id";
import { Product, ProductType } from "./Product";

export interface ExportTypeArgs<P extends Product> {
  id: Id,
  productType: ProductType<P>,
  extension?: string,
  name: string,
  export: (value: P) => string | Buffer,
  hidden?: boolean,
}

export class ExportType<P extends Product> implements ExportTypeArgs<P> {

  id: Id;
  productType: ProductType<P>;
  extension: string;
  name: string;
  export: (value: P) => string | Buffer;
  hidden: boolean;

  store: ArtifactStore = {
    lookupRef: async ([id, product], artifactManager) => {
      if(id !== this.id) return null;
      if(!Product.isProduct<P>(product, this.productType)) return null;
      const exported = Buffer.from(this.export(product));
      await artifactManager.storeRef([id, product], exported);
      return exported;
    }
  };

  constructor({ id, extension, name, export: exportFunc, productType, hidden = false }: ExportTypeArgs<P>){
    if(extension && !extension.startsWith("."))
      extension = "." + extension;

    this.id = id;
    this.name = name;
    this.export = exportFunc;
    this.extension = extension ?? "";
    this.productType = productType;
    this.hidden = hidden;
  }

}
