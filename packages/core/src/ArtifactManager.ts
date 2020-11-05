
import fs from "fs-extra";

import { Sha } from "./hash";
import { Id } from "./Id";
import { ReadonlyArtifactManager } from "./ReadonlyArtifactManager";

export class ArtifactManager<T> extends ReadonlyArtifactManager<T> {

  constructor(
    subdir: Id,
    serialize: (value: T) => string | Buffer = JSON.stringify,
    public deserialize: (value: string) => T = JSON.parse
  ){
    super(subdir, serialize);
  }

  async lookup(sha: Sha){
    return await this.cache.getAsync(sha, async () => {
      const path = await this.getPath(sha);
      return this.deserialize(await fs.readFile(path, "utf8"));
    })
  }

}
