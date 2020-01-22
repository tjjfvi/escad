
const { Product } = require(".");
const { Face, Vector3 } = require("./Face");

class Mesh extends Product {

  static id = "Mesh";

  construct(faces){
    this.faces = faces;
  }

  serialize(){
    return Buffer.concat(this.faces.flatMap(f => f.serialize()));
  }

  static deserialize(buf){
    const length = 4 * 3 * 3;
    let ind = 0;
    let faces = [];
    while(ind < buf.length)
      faces.push(Face.deserialize(buf.slice(ind, ind += length)));
    return new Mesh(faces);
  }

}

Product.Registry.register(Mesh);

module.exports = { Mesh, Face, Vector3 };
