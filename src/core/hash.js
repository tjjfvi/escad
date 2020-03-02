
const crypto = require('crypto');
const hash = (buf, encoding) => crypto.createHash("sha256").update(buf).digest(encoding);
hash.buffer = hash;
hash.json = (obj, encoding) => hash(JSON.stringify(obj), encoding);
hash.hex = x => hash(x, "hex");
hash.json.hex = x => hash.json(x, "hex");
hash.buffer.hex = x => hash.json(x, "hex");

module.exports = hash;
