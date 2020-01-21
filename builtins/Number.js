
const { Product, Component, operators } = require(".");
const { LeafWork } = require("./LeafWork");

class Number extends Product {

  static id = "Number";

  construct(n){
    this.n = n;
  }

  serialize(){
    return Buffer.from(this.n.toString());
  }

  static deserialize(buffer){
    return new Number(+buffer.toString("utf8"));
  }

}

Product.Registry.register(Number);

operators.number = n => new Component(new LeafWork([], new Number(n)));

module.exports = { Number };
