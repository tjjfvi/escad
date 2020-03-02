
const b64 = b => b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

module.exports = b64;
