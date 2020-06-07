
class _B64 {

 declare private _b64: true;

}
export type B64 = string & _B64

export const unB64 = (b64: B64): Buffer => {
  let base64NoEq = b64.replace(/-/g, "+").replace(/_/g, "/").replace(/=/g, "");
  let base64 = base64NoEq.padEnd(Math.ceil(base64NoEq.length / 4) * 4, "=");
  return Buffer.from(base64, "base64");
}

export const b64 = (b: Buffer): B64 =>
  b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "") as B64
