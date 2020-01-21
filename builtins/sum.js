
const { operators, Component } = require(".");
const { AddWork } = require("./AddWork");

operators.sum = (...n) => new Component(new AddWork(n));
