
const Component = require("../Component");
const Product = require("../Product");
const ProductManager = require("../ProductManager");
const Work = require("../Work");
const chainables = require("../chainables");
const operators = require("../operators");

module.exports = {
  Component,
  Product,
  ProductManager,
  Work,
  chainables,
  operators
};

Object.assign(
  module.exports,
  ...require("fs")
    .readdirSync(__dirname)
    .filter(f => f !== "index.js")
    .map(f => require("./" + f))
);
