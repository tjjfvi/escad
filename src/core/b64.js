// @flow

const b64 = (b: Buffer | string) =>
  typeof b === "string" ?
    b :
    b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

export default b64;
