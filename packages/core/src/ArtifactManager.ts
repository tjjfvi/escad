
import fs from "fs-extra";

import { Sha } from "./hash";
import { ReadonlyArtifactManager } from "./ReadonlyArtifactManager";

export abstract class ArtifactManager<T> extends ReadonlyArtifactManager<T> {

  abstract deserialize(buffer: Buffer): T | null | Promise<T | null>;

  async lookup(sha: Sha){
    return await this.cache.getAsync(sha.b64, async () => {
      let buffer = await fs.readFile(await this.getPath(sha)).catch(() => null);
      if(!buffer)
        return null;
      return await this.deserialize(buffer);
    })
  }

}
