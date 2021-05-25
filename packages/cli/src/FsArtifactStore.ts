
import { Hash, Id, ArtifactStore, WrappedValue, $wrappedValue } from "@escad/core"
import { join, dirname } from "path"
import fs from "fs"
import { promisify } from "util"
import { v4 as uuidv4 } from "uuid"
import stream, { Readable } from "stream"

const symlink = promisify(fs.symlink)
const rename = promisify(fs.rename)
const mkdir = promisify(fs.mkdir)
const pipeline = promisify(stream.pipeline)

export class FsArtifactStore implements ArtifactStore {

  constructor(public rootDir: string){}

  async storeRaw(hash: Hash<unknown>, value: WrappedValue){
    const path = await this.getPathRaw(hash)
    const writeStream = fs.createWriteStream(path, { flags: "wx" })
    pipeline(
      Readable.from($wrappedValue.serialize(value)),
      writeStream,
    ).catch(() => null)
  }

  async storeRef(loc: readonly unknown[], hash: Hash<unknown>){
    const fromPath = await this.getPathRef(loc)
    const toPath = await this.getPathRaw(hash)
    const tmpPath = await this.getPathTmp()
    await symlink(toPath, tmpPath)
    await rename(tmpPath, fromPath)
  }

  async lookupRaw(hash: Hash<unknown>){
    const path = await this.getPathRaw(hash)
    return await $wrappedValue.deserializeAsyncStream(fs.createReadStream(path)).catch(e => {
      console.log(e)
      return null
    })
  }

  async lookupRef(loc: readonly unknown[]){
    const path = await this.getPathRef(loc)
    return await $wrappedValue.deserializeAsyncStream(fs.createReadStream(path)).catch(() => null)
  }

  private async getPathTmp(){
    const id = uuidv4()
    const path = join(this.rootDir, id)
    await mkdir(dirname(path), { recursive: true })
    return path
  }

  private async getPathRaw(hash: Hash<unknown>){
    const path = join(this.rootDir, "raw", hash)
    await mkdir(dirname(path), { recursive: true })
    return path
  }

  private async getPathRef(loc: readonly unknown[]){
    const path = join(this.rootDir, ...loc.map(x => Id.isId(x) ? x.replace(/\//g, "-") : Hash.create(x)))
    await mkdir(dirname(path), { recursive: true })
    return path
  }

}
