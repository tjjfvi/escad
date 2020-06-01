
class _B64 { declare private _b64: true; }
export type B64 = string & _B64

const b64 = (b: Buffer): B64 =>
  b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "") as B64

export default b64;
