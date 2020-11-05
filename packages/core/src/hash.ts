
import crypto from "crypto";
import { Hex } from "./hex";
import { timers } from "./Timer";

export type Sha = Hex;

export const hash = (obj: any): Sha => {
  const hash = crypto.createHash("sha256");
  timers.sha.start();
  hash.update(JSON.stringify(obj));
  timers.sha.end();
  return hash.digest("hex") as Hex;
};
