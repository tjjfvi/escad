
const { Product } = require(".");
const { Vector3 } = require("./Vector3");

class Face extends Product {

  static id = "Face";

  construct(points){
    this.points = points;
  }

  serialize(){
    return Buffer.concat(this.points.map(p => p.serialize()));
  }

  static deserialize(buf){
    return [...Array(buf.length / 24)].map((_, i) => Vector3.deserialize(buf.slice(i * 24, i * 24 + 24)));
  }

}

Product.Registry.register(Face);

module.exports = { Face, Vector3 };
