
import crypto from "crypto";
import { timers } from "./Timer";

export const hash = timers.sha.time(<T>(obj: T): Hash<T> => {
  const hash = crypto.createHash("sha256");
  hash.update(JSON.stringify(obj));
  return hash.digest("hex") as Hash<T>;
});

export type Hash<T = unknown> = string & { __hash__: T };
