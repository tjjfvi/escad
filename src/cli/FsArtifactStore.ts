import {
  $wrappedValue,
  ArtifactStore,
  Hash,
  Id,
  WrappedValue,
} from "../core/mod.ts";
import { copy, iterateReader, readerFromIterable } from "../deps/streams.ts";
import { dirname, join } from "../deps/path.ts";

export class FsArtifactStore implements ArtifactStore {
  constructor(public rootDir: string) {}

  async storeRaw(hash: Hash<unknown>, value: WrappedValue) {
    const path = await this.getPathRaw(hash);
    const file = await Deno.open(path, { write: true, create: true });
    await copy(readerFromIterable($wrappedValue.serialize(value)), file);
  }

  async storeRef(loc: readonly unknown[], hash: Hash<unknown>) {
    const fromPath = await this.getPathRef(loc);
    const toPath = await this.getPathRaw(hash);
    await Deno.symlink(toPath, fromPath).catch(() => null);
  }

  async lookupRaw(hash: Hash<unknown>) {
    const path = await this.getPathRaw(hash);
    try {
      return await $wrappedValue.deserializeAsync(
        iterateReader(await Deno.open(path)),
      );
    } catch {
      return null;
    }
  }

  async lookupRef(loc: readonly unknown[]) {
    const path = await this.getPathRef(loc);
    try {
      return await $wrappedValue.deserializeAsync(
        iterateReader(await Deno.open(path)),
      );
    } catch {
      return null;
    }
  }

  private async getPathRaw(hash: Hash<unknown>) {
    const path = join(this.rootDir, "raw", hash);
    this.mkdirp(dirname(path));
    return path;
  }

  private async getPathRef(loc: readonly unknown[]) {
    const path = join(
      this.rootDir,
      ...loc.map((x) => Id.isId(x) ? x.replace(/\//g, "-") : Hash.create(x)),
    );
    await Deno.mkdir(dirname(path), { recursive: true });
    return path;
  }

  private async mkdirp(path: string) {
    await Deno.mkdir(path, { recursive: true });
  }
}
