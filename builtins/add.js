
const { chainables } = require(".");
const { AddWork } = require("./AddWork");

chainables.add = (comp, n) => comp(new AddWork([comp()], n));
