
import fs from "fs-extra";
import path from "path";

import { Id } from "./Id";
import { WeakCache } from "./WeakCache";
import { Sha } from "./hash";
import { B64 } from "./b64";

export abstract class ArtifactManager<T> {

  static artifactsDir: string | null = null;

  private cache = new WeakCache<B64, T | null>();

  abstract subdir: Id | string;

  get subdirString() {
    return this.subdir instanceof Id ? this.subdir.sha.b64 : this.subdir;
  }

  get dir() {
    if (!ArtifactManager.artifactsDir)
      throw new Error("ArtifactManager.artifactsDir has not been set");
    return path.join(ArtifactManager.artifactsDir, this.subdirString);
  }

  abstract serialize(artifact: T): Buffer | Promise<Buffer>;
  abstract deserialize(buffer: Buffer): T | null | Promise<T | null>;

  getPath(sha: Sha) {
    return path.join(this.dir, sha.b64);
  }

  async lookup(sha: Sha) {
    return await this.cache.getAsync(sha.b64, async () => {
      let buffer = await fs.readFile(this.getPath(sha)).catch(() => null);
      if (!buffer)
        return null;
      return await this.deserialize(buffer);
    })
  }

  async store(sha: Sha, promise: Promise<T>) {
    return this.cache.setAsync(sha.b64, async () => {
      let artifact = await promise;
      let buffer = await this.serialize(artifact);
      await fs.writeFile(this.getPath(sha), buffer);
      return artifact;
    });
  }

  async storePointer(fromSha: Sha, toSha: Sha) {
    await fs.symlink(this.getPath(toSha), this.getPath(fromSha));
  }

}
