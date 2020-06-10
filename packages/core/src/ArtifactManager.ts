
import fs from "fs-extra";

import { Sha } from "./hash";
import { ReadonlyArtifactManager } from "./ReadonlyArtifactManager";

export abstract class ArtifactManager<T> extends ReadonlyArtifactManager<T> {

  abstract deserialize(buffer: Buffer): T | null | Promise<T | null>;

  async lookup(sha: Sha){
    return await this.cache.getAsync(sha.hex, async () => {
      let buffer = await fs.readFile(await this.getPath(sha)).catch(() => null);
      if(!buffer)
        return null;
      return await this.deserialize(buffer);
    })
  }

  abstract getSha(t: T): Sha

  reference = () => Sha.reference().map<T>({
    serialize: t => this.getSha(t),
    deserialize: async sha => {
      const artifact = await this.lookup(sha);
      if(!artifact)
        throw new Error(`Could not find artifact of sha ${sha}`);
      return artifact;
    }
  })

}
