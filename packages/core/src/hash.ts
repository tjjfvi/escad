
import crypto from "crypto";
import { hex, Hex, unHex } from "./hex";
import { constLengthBuffer } from "tszer";
import { Readable } from "stream";
import { timers } from "./Timer";

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

export const hash = (stream: Readable) => new Promise<Sha>(resolve => {
  const hash = crypto.createHash("sha256");
  timers.sha.start();
  stream
    .pipe(hash)
    .once("finish", () => {
      timers.sha.end();
      resolve(new Sha(hash.digest()));
      hash.destroy();
    })
});

const _buffer = (buf: Buffer | string) => new Sha(crypto.createHash("sha256").update(buf).digest());
hash.buffer = _buffer;
