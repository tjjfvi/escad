// @flow

import crypto from "crypto";
import b64 from "./b64";

export class Sha {
  b64: string;
  constructor(public buffer: Buffer) {
    this.b64 = b64(this.buffer);
  }
}

export const hash = (buf: Buffer | string) => new Sha(crypto.createHash("sha256").update(buf).digest());
const _json = (obj: any) => hash(JSON.stringify(obj));
hash.json = _json;
