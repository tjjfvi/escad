
import fs from "fs-extra";
import { Readable } from "stream";

import { Sha } from "./hash";
import { ReadonlyArtifactManager } from "./ReadonlyArtifactManager";

export abstract class ArtifactManager<T> extends ReadonlyArtifactManager<T> {

  abstract deserialize(stream: Readable): Promise<T | null>;

  async lookup(sha: Sha){
    return await this.cache.getAsync(sha.hex, async () => {
      const path = await this.getPath(sha);
      let stream = fs.createReadStream(path);
      return await new Promise(resolve => {
        stream
          .once("open", () => {
            resolve(this.deserialize(stream));
          })
          .once("error", () => resolve(null));
      })
    })
  }

  abstract getSha(t: T): Promise<Sha>

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
