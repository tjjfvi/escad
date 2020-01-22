
const { Product } = require(".");
const { Vector3 } = require("./Vector3");

class Face extends Product {

  static id = "Face";

  construct(points){
    if(points.length !== 3)
      throw new Error("Faces can only be triangles");
    this.points = points;
  }

  serialize(){
    return Buffer.concat(this.points.map(p => p.serialize()));
  }

  static deserialize(buf){
    return new Face([...Array(3)].map((_, i) => Vector3.deserialize(buf.slice(i * 12, i * 12 + 12))));
  }

}

Product.Registry.register(Face);

module.exports = { Face, Vector3 };
