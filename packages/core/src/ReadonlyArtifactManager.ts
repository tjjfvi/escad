
import fs from "fs-extra";
import path from "path";
import { Readable } from "stream";

import { Id } from "./Id";
import { WeakCache } from "./WeakCache";
import { Sha } from "./hash";
import { Hex } from "./hex";
import { v4 as uuidv4 } from "uuid";
import { once } from "events";

export abstract class ReadonlyArtifactManager<T> {

  private static _artifactsDirResolve: null | ((value: string) => void) = null;
  static artifactsDir: Promise<string> = new Promise(r => ReadonlyArtifactManager._artifactsDirResolve = r);

  static setArtifactsDir(dir: string){
    if(!this._artifactsDirResolve)
      return this.artifactsDir = Promise.resolve(dir);
    this._artifactsDirResolve(dir);
    this._artifactsDirResolve = null;
    return dir;
  }

  cache = new WeakCache<Hex, T | null>();

  abstract subdir: Id | string;

  get subdirString(){
    return this.subdir instanceof Id ? this.subdir.sha.hex : this.subdir;
  }

  private _dir = "";
  private _dirProm: Promise<string> = Promise.resolve("");

  async getDir(){
    let newDir = path.join(await ReadonlyArtifactManager.artifactsDir, this.subdirString);
    if(this._dir && this._dir === newDir)
      return this._dirProm;
    this._dir = newDir;
    return this._dirProm = fs.mkdirp(newDir).then(() => this._dir);
  }

  abstract serialize(artifact: T): Readable

  async getPath(sha: Sha){
    return path.join(await this.getDir(), sha.hex);
  }

  async store(sha: Sha, artifactPromise: T | Promise<T>){
    return this.cache.setAsync(sha.hex, async () => {
      let artifact = await artifactPromise;
      let stream = this.serialize(artifact);
      stream.pipe(fs.createWriteStream(await this.getPath(sha)));
      await once(stream, "end");
      return artifact;
    });
  }

  async storePointer(fromSha: Sha, toSha: Sha){
    this.symlinkSafe(await this.getPath(toSha), await this.getPath(fromSha));
  }

  protected async symlinkSafe(from: string, to: string){
    const id = path.join(await this.getDir(), uuidv4());
    await fs.symlink(from, id);
    await fs.rename(id, to);
  }

}
