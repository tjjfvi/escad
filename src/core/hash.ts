// @flow

import crypto from "crypto";
import b64 from "./b64";

let _hash = (buf: Buffer | string) => crypto.createHash("sha256").update(buf).digest();
let props = {};
props.buffer = _hash;
props.json = (obj: any) => _hash(JSON.stringify(obj));
props.b64 = (x: string) => b64(_hash(x))
props.json.b64 = (x: any) => b64(props.json(x));

type Hash = typeof _hash & typeof props;
const hash: Hash = Object.assign(_hash, props);

export default hash;
export type { Hash };
