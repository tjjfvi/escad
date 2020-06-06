
import fs from "fs-extra";
import path from "path";

import { Id } from "./Id";
import { WeakCache } from "./WeakCache";
import { Sha } from "./hash";
import { B64 } from "./b64";
import { v4 as uuidv4 } from "uuid";

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

  cache = new WeakCache<B64, T | null>();

  abstract subdir: Id | string;

  get subdirString(){
    return this.subdir instanceof Id ? this.subdir.sha.b64 : this.subdir;
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

  abstract serialize(artifact: T): Buffer | Promise<Buffer>;

  async getPath(sha: Sha){
    return path.join(await this.getDir(), sha.b64);
  }

  async store(sha: Sha, promise: Promise<T>){
    return this.cache.setAsync(sha.b64, async () => {
      let artifact = await promise;
      let buffer = await this.serialize(artifact);
      await fs.writeFile(await this.getPath(sha), buffer);
      return artifact;
    });
  }

  async storePointer(fromSha: Sha, toSha: Sha){
    this.symlinkSafe(await this.getPath(toSha), await this.getPath(fromSha));
  }

  protected async symlinkSafe(from: string, to: string){
    const id = uuidv4();
    await fs.symlink(from, id);
    await fs.rename(id, to);
  }

}
