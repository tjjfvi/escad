
import fs from "fs-extra";

import { Sha } from "./hash";
import { ReadonlyArtifactManager } from "./ReadonlyArtifactManager";

export abstract class ArtifactManager<T, U> extends ReadonlyArtifactManager<T, U> {

  abstract rehydrate(obj: U): T;

  async lookup(sha: Sha){
    return await this.cache.getAsync(sha, async () => {
      const path = await this.getPath(sha);
      const obj: U = JSON.parse(await fs.readFile(path, "utf8"));
      return this.rehydrate(obj);
    })
  }

}
