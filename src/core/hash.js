
import crypto from "crypto";
import b64 from "./b64";

const hash = (buf, encoding) => crypto.createHash("sha256").update(buf).digest(encoding);
hash.buffer = hash;
hash.json = (obj, encoding) => hash(JSON.stringify(obj), encoding);
hash.hex = x => hash(x, "hex");
hash.json.hex = x => hash.json(x, "hex");
hash.b64 = x => b64(hash(x))
hash.json.hex = x => b64(hash.json(x));

export default hash;
