// @flow

import crypto from "crypto";
import b64 from "./b64";

let _hash = (buf: Buffer | string, encoding?: "hex") => crypto.createHash("sha256").update(buf).digest(encoding);
let props = {};
props.buffer = _hash;
props.json = (obj: any, encoding?: "hex") => _hash(JSON.stringify(obj), encoding);
props.hex = (x: string) => _hash(x, "hex");
props.json.hex = x => _hash.json(x, "hex");
props.b64 = (x: string) => b64(_hash(x))
props.json.hex = x => b64(_hash.json(x));

type Hash = typeof _hash & typeof props;
const hash: Hash = Object.assign(_hash, props);

export default hash;
export type { Hash };
