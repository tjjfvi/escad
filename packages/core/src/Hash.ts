
import crypto from "crypto"
import { timers } from "./Timer"

export const Hash = {
  create: timers.hash.time(<T>(obj: T): Hash<T> => {
    const hash = crypto.createHash("sha256")
    hash.update(timers.stringifyHash.time(JSON.stringify)(obj))
    return hash.digest("hex") as Hash<T>
  }),
  equal: (a: unknown, b: unknown) => {
    if(a === b)
      return true
    if(typeof a !== "object" || typeof b !== "object")
      return false
    if(!a || !b)
      return false
    if(a["type" as never] !== b["type" as never])
      return false
    return Hash.create(a) === Hash.create(b)
  },
  check: <T>(hash: Hash<T>, value: unknown): value is T & NonExhaustive =>
    Hash.create(value) === hash,
}

export declare const __hash: unique symbol
export type __hash = typeof __hash
export type Hash<T> = string & { [__hash]: T }

declare class NonExhaustive {

 private __nonExhaustive__: never

}
