
import { hash, Hash, Id, ArtifactStore, BufferLike } from "@escad/core";
import { join, dirname } from "path";
import fs from "fs-extra";
import { v4 as uuidv4 } from "uuid";

export class FsArtifactStore implements ArtifactStore {

  constructor(public rootDir: string){}

  async storeRaw(hash: Hash, buffer: BufferLike){
    const path = await this.getPathRaw(hash);
    await fs.writeFile(path, buffer)
  }

  async storeRef(loc: readonly unknown[], hash: Hash){
    const fromPath = await this.getPathRef(loc);
    const toPath = await this.getPathRaw(hash);
    const tmpPath = await this.getPathTmp();
    await fs.symlink(toPath, tmpPath);
    await fs.rename(tmpPath, fromPath);
  }

  async lookupRaw(hash: Hash){
    const path = await this.getPathRaw(hash);
    return await fs.readFile(path).catch(() => null);
  }

  async lookupRef(loc: readonly unknown[]){
    const path = await this.getPathRef(loc);
    return await fs.readFile(path).catch(() => null);
  }

  private async getPathTmp(){
    const id = uuidv4();
    const path = join(this.rootDir, id);
    await fs.mkdirp(dirname(path));
    return path;
  }

  private async getPathRaw(hash: Hash){
    const path = join(this.rootDir, "raw", hash);
    await fs.mkdirp(dirname(path));
    return path;
  }

  private async getPathRef(loc: readonly unknown[]){
    const path = join(this.rootDir, ...loc.map(x => Id.isId(x) ? x.full : hash(x)));
    await fs.mkdirp(dirname(path));
    return path;
  }

}
