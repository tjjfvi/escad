
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

  private _dir: string = "";
  private _dirProm: Promise<string> = Promise.resolve("");

  get dir() {
    if (!ArtifactManager.artifactsDir)
      throw new Error("ArtifactManager.artifactsDir has not been set");
    let newDir = path.join(ArtifactManager.artifactsDir, this.subdirString);
    if (this._dir && this._dir === newDir)
      return this._dirProm;
    this._dir = newDir;
    return this._dirProm = fs.mkdirp(newDir).then(() => this._dir);
  }

  abstract serialize(artifact: T): Buffer | Promise<Buffer>;
  abstract deserialize(buffer: Buffer): T | null | Promise<T | null>;

  async getPath(sha: Sha) {
    return path.join(await this.dir, sha.b64);
  }

  async lookup(sha: Sha) {
    return await this.cache.getAsync(sha.b64, async () => {
      let buffer = await fs.readFile(await this.getPath(sha)).catch(() => null);
      if (!buffer)
        return null;
      return await this.deserialize(buffer);
    })
  }

  async store(sha: Sha, promise: Promise<T>) {
    return this.cache.setAsync(sha.b64, async () => {
      let artifact = await promise;
      let buffer = await this.serialize(artifact);
      await fs.writeFile(await this.getPath(sha), buffer);
      return artifact;
    });
  }

  async storePointer(fromSha: Sha, toSha: Sha) {
    await fs.symlink(await this.getPath(toSha), await this.getPath(fromSha));
  }

}
