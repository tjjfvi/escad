
import { ExportType } from "./ExportType";
import { Product } from "./Product";
import { Sha } from "./hash";
import { ReadonlyArtifactManager } from "./ReadonlyArtifactManager";

export class ExportManager<P extends Product<P>> extends ReadonlyArtifactManager<P> {

  subdir: string;

  async getPath(sha: Sha){
    let path = await super.getPath(sha)
    let pathExt = path + this.exportType.extension;
    this.symlinkSafe(pathExt, path);
    return pathExt;
  }

  constructor(public exportType: ExportType<P>){
    super();
    this.subdir = "exports/" + exportType.id.sha.b64;
  }

  serialize(product: P){
    return this.exportType.export(product);
  }

  async store(sha: Sha, productPromise: Promise<P>){
    const product = await productPromise;
    if(sha === product.sha)
      return await super.store(sha, productPromise);
    await super.storePointer(sha, product.sha);
    return await super.store(product.sha, productPromise);
  }

}
