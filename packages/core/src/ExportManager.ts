
import { ExportType } from "./ExportType";
import { LeafProduct } from "./LeafProduct";
import { Sha } from "./hash";
import { ReadonlyArtifactManager } from "./ReadonlyArtifactManager";

export class ExportManager<P extends LeafProduct> extends ReadonlyArtifactManager<P> {

  subdir: string;

  async getPath(sha: Sha){
    let path = await super.getPath(sha)
    let pathExt = path + this.exportType.extension;
    this.symlinkSafe(pathExt, path);
    return pathExt;
  }

  constructor(public exportType: ExportType<P>){
    super();
    this.subdir = "exports/" + exportType.id.sha.hex;
  }

  serialize(product: P){
    return this.exportType.exportStream(product);
  }

  async store(sha: Sha, productPromise: Promise<P>){
    const product = await productPromise;
    const productSha = await product.sha;
    if(sha === productSha)
      return await super.store(sha, productPromise);
    await super.storePointer(sha, productSha);
    return await super.store(productSha, productPromise);
  }

}
