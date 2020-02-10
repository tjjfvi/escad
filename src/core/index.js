
Math.tau = 6.283185307179586472128676655;

const builtins = require("./builtins");
const Component = require("./Component");

module.exports = Object.assign((...a) => new Component(a.length === 1 ? a[0] : a), builtins, builtins.operators);
