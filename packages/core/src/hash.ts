
import crypto from "crypto";
import { Hex } from "./hex";
import { timers } from "./Timer";

export type Sha = Hex;

export const hash = timers.sha.time((obj: any): Sha => {
  const hash = crypto.createHash("sha256");
  hash.update(JSON.stringify(obj));
  return hash.digest("hex") as Hex;
});
