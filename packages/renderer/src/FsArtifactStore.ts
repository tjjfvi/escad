
import { hash, Hash, Id, ArtifactStore, BufferLike } from "@escad/core";
import { join, dirname } from "path";
import fs from "fs";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";

const writeFile = promisify(fs.writeFile);
const symlink = promisify(fs.symlink);
const rename = promisify(fs.rename);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);

export class FsArtifactStore implements ArtifactStore {

  constructor(public rootDir: string){}

  async storeRaw(hash: Hash, buffer: BufferLike){
    const path = await this.getPathRaw(hash);
    await writeFile(path, buffer);
  }

  async storeRef(loc: readonly unknown[], hash: Hash){
    const fromPath = await this.getPathRef(loc);
    const toPath = await this.getPathRaw(hash);
    const tmpPath = await this.getPathTmp();
    await symlink(toPath, tmpPath);
    await rename(tmpPath, fromPath);
  }

  async lookupRaw(hash: Hash){
    const path = await this.getPathRaw(hash);
    return await readFile(path).catch(() => null);
  }

  async lookupRef(loc: readonly unknown[]){
    const path = await this.getPathRef(loc);
    return await readFile(path).catch(() => null);
  }

  private async getPathTmp(){
    const id = uuidv4();
    const path = join(this.rootDir, id);
    await mkdir(dirname(path), { recursive: true });
    return path;
  }

  private async getPathRaw(hash: Hash){
    const path = join(this.rootDir, "raw", hash);
    await mkdir(dirname(path), { recursive: true });
    return path;
  }

  private async getPathRef(loc: readonly unknown[]){
    const path = join(this.rootDir, ...loc.map(x => Id.isId(x) ? x.full.replace(/\//g, "-") : hash(x)));
    await mkdir(dirname(path), { recursive: true });
    return path;
  }

}
