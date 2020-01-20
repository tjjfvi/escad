
const crypto = require('crypto');
const hash = obj => crypto.createHash("sha256").update(JSON.stringify(obj)).digest("hex");

module.exports = hash;
