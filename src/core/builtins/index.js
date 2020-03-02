
const Component = require("../Component");
const Product = require("../Product");
const ProductManager = require("../ProductManager");
const Work = require("../Work");
const Hierarchy = require("../Hierarchy");
const chainables = require("../chainables");
const operators = require("../operators");
const arrayish = require("../arrayish");
const Id = require("../Id");

module.exports = {
  Component,
  Product,
  ProductManager,
  Work,
  Hierarchy,
  chainables,
  operators,
  arrayish,
  Id,
};

Object.assign(
  module.exports,
  ...require("fs")
    .readdirSync(__dirname)
    .filter(f => f !== "index.js")
    .map(f => require("./" + f))
    .map(o => o._exclude ? {} : o)
);
