
const Registry = require("./Registry");

class Object {

  static Registry = new Registry("ObjectRegistry");

  static id = null;

  constructor(...args){
    this.construct(...args)
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

module.exports = Object;
