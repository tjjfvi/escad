// @flow

opaque type _B64 = string;
type B64 = _B64 & string;

const b64 = (b: Buffer | string | B64): B64 =>
  typeof b === "string" ?
    b :
    // $FlowFixMe
    b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

export default b64;
export type { B64 };
