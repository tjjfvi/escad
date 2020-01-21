
const { Product } = require(".");
const { Face, Vector3 } = require("./Face");

class Mesh extends Product {

  static id = "Mesh";

  construct(faces){
    this.faces = faces;
  }

  serialize(){
    return Buffer.concat(this.faces.flatMap(f => {
      let buf = f.serialize();
      let lbuf = Buffer.alloc(4);
      lbuf.writeUInt32LE(buf.length)
      return [lbuf, buf];
    }));
  }

  static deserialize(buf){
    let ind = 0;
    let faces = [];
    while(ind < buf.length) {
      let length = buf.readUInt32LE(ind);
      ind += 4;
      faces.push(Face.deserialize(buf.slice(ind, ind += length)));
    }
    return new Mesh(faces);
  }

}

Product.Registry.register(Mesh);

module.exports = { Mesh, Face, Vector3 };
