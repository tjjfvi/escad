
import { ArtifactStore, Hash, HashMap } from "@escad/core"

export class InMemoryArtifactStore implements ArtifactStore {

  readonly raw = new Map<Hash<unknown>, Buffer>();
  readonly ref = new HashMap<readonly unknown[], Hash<unknown>>();

  async storeRaw(hash: Hash<unknown>, buffer: Buffer){
    this.raw.set(hash, buffer)
  }

  async lookupRaw(hash: Hash<unknown>){
    return this.raw.get(hash) ?? null
  }

  async storeRef(loc: readonly unknown[], hash: Hash<unknown>){
    this.ref.set(loc, hash)
  }

  async lookupRef(loc: readonly unknown[]){
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.raw.get(this.ref.get(loc)!) ?? null
  }

}
