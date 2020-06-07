
import crypto from "crypto";
import { b64, B64, unB64 } from "./b64";

export class Sha {

  buffer: Buffer;
  b64: B64;

  constructor(b64: B64)
  constructor(buffer: Buffer)
  constructor(arg: B64 | Buffer){
    this.buffer = arg instanceof Buffer ? arg : unB64(arg);
    this.b64 = b64(this.buffer);
  }

}

export const hash = (buf: Buffer | string) => new Sha(crypto.createHash("sha256").update(buf).digest());
const _json = (obj: any) => hash(JSON.stringify(obj));
hash.json = _json;
