import {
  $wrappedValue,
  ArtifactStore,
  Hash,
  Id,
  WrappedValue,
} from "../core/mod.ts";
import { iterateReader, readerFromStreamReader } from "../deps/streams.ts";
import { join } from "../deps/path.ts";
import { getVfs, putVfs } from "./vfs.ts";

export class VfsArtifactStore implements ArtifactStore {
  async storeRaw(hash: Hash<unknown>, value: WrappedValue) {
    const path = this.getPathRaw(hash);
    let chunks = [];
    for await (let chunk of $wrappedValue.serialize(value)) {
      chunks.push(chunk);
    }
    await putVfs(path, new Blob(chunks));
  }

  async storeRef(loc: readonly unknown[], hash: Hash<unknown>) {
    const path = this.getPathRef(loc);
    await putVfs(path, hash);
  }

  async lookupRaw(hash: Hash<unknown>) {
    const response = await getVfs(this.getPathRaw(hash));
    if (!response.ok || !response.body) return null;
    return await $wrappedValue.deserializeAsync(
      iterateReader(readerFromStreamReader(response.body.getReader())),
    );
  }

  async lookupRef(loc: readonly unknown[]) {
    const response = await getVfs(this.getPathRef(loc));
    if (!response.ok) return null;
    return this.lookupRaw(await response.text() as Hash<unknown>);
  }

  private getPathRaw(hash: Hash<unknown>) {
    return `artifacts/raw/` + hash;
  }

  private getPathRef(loc: readonly unknown[]) {
    const path = join(
      "artifacts",
      ...loc.map((x) => Id.isId(x) ? x.replace(/\//g, "-") : Hash.create(x)),
    );
    return path;
  }
}
