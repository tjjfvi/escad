
import { ArtifactStore } from "./ArtifactStore.ts"
import { Hash } from "./Hash.ts"
import { HashMap } from "./HashMap.ts"
import { WrappedValue } from "./WrappedValue.ts"

export class InMemoryArtifactStore implements ArtifactStore {

  readonly raw = new Map<Hash<unknown>, WrappedValue>()
  readonly ref = new HashMap<readonly unknown[], Hash<unknown>>()

  async storeRaw(hash: Hash<unknown>, value: WrappedValue){
    this.raw.set(hash, value)
  }

  async lookupRaw(hash: Hash<unknown>){
    console.log(this.raw)
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
