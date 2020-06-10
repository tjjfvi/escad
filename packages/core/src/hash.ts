
import crypto from "crypto";
import { hex, Hex, unHex } from "./hex";
import { constLengthBuffer } from "tszer";

export class Sha {

  buffer: Buffer;
  hex: Hex;

  constructor(hex: Hex)
  constructor(buffer: Buffer)
  constructor(arg: Hex | Buffer){
    this.buffer = arg instanceof Buffer ? arg : unHex(arg);
    this.hex = hex(this.buffer);
  }

  static reference = () => constLengthBuffer(32).map<Sha>({
    serialize: sha => sha.buffer,
    deserialize: buffer => new Sha(buffer),
  });

}

export const hash = (buf: Buffer | string) => new Sha(crypto.createHash("sha256").update(buf).digest());
const _json = (obj: any) => hash(JSON.stringify(obj));
hash.json = _json;
