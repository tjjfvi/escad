
import Registry from "./Registry";

class Product {

  static Registry = new Registry("ProductRegistry");

  static id = null;

  constructor(...args){
    this.meta = {};
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

  static get exportTypes(){
    if(Object.prototype.hasOwnProperty.call(this, "_exportTypes"))
      return this._exportTypes;
    return this._exportTypes = {};
  }

}

export default Product;
