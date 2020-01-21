
const Registry = require("./Registry");

class Product {

  static Registry = new Registry("ProductRegistry");

  static id = null;

  constructor(...args){
    this.construct(...args)
    Object.freeze(this);
  }

  construct(...args){
    this.args = args;
  }

  serialize(){
    return Buffer.from(JSON.stringify(this.args));
  }

  static deserialize(buffer){
    return new this(...JSON.parse(buffer.toString("utf8")));
  }

}

module.exports = Product;
