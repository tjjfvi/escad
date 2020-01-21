
const Component = require("../Component");
const Product = require("../Product");
const Work = require("../Work");
const chainables = require("../chainables");
const operators = require("../operators");

module.exports = { Component, Product, Work, chainables, operators };

module.exports = Object.assign({}, ...require("fs").readdirSync(__dirname).filter(f => f !== "index.js").map(f =>
  require("./" + f)
));
