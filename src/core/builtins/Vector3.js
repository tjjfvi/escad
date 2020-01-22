
const { Product } = require(".");

class Vector3 extends Product {

  static id = "Vector3";

  construct(x, y, z){
    this.x = x;
    this.y = y;
    this.z = z;
  }

  serialize(){
    let buf = Buffer.alloc(12);
    buf.writeFloatLE(this.x, 0)
    buf.writeFloatLE(this.y, 4)
    buf.writeFloatLE(this.z, 8)
    return buf;
  }

  static deserialize(buf){
    return new Vector3(buf.readFloatLE(0), buf.readFloatLE(4), buf.readFloatLE(8));
  }

  add(that){
    return new Vector3(this.x + that.x, this.y + that.y, this.z + that.z);
  }

  subtract(that){
    return new Vector3(this.x - that.x, this.y - that.y, this.z - that.z);
  }

  multiplyComponents(that){
    return new Vector3(this.x * that.x, this.y * that.y, this.z * that.z);
  }

  multiplyScalar(n){
    return new Vector3(this.x * n, this.y * n, this.z * n);
  }

}

Product.Registry.register(Vector3);

module.exports = { Vector3 };
