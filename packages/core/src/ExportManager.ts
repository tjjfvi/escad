
import { ArtifactManager } from "./ArtifactManager";
import { ExportType } from "./ExportType";
import { Sha } from "./hash";
import { Product } from "./Product";

export class ExportManager<P extends Product> extends ArtifactManager<P> {

  async getPath(sha: Sha){
    let path = await super.getPath(sha)
    let pathExt = path + this.exportType.extension;
    this.symlinkSafe(pathExt, path);
    return pathExt;
  }

  constructor(public exportType: ExportType<P>){
    super(exportType.id, exportType.export, () => {
      throw new Error("Cannot deserialize exported products");
    });
  }

}
