/* eslint-disable array-element-newline */

const { Product } = require(".");
const { Vector3 } = require("./Vector3");

const c = Math.cos;
const s = Math.sin;
const S = x => -Math.sin(x);

class Matrix4 extends Product {

  static id = "Matrix4";

  construct(vs){
    if(vs.length !== 16)
      throw new Error("Must give 16 numbers to Matrix4");
    this.vs = vs;
  }

  serialize(){
    let buf = Buffer.alloc(4 * 16);
    this.vs.map((v, i) => buf.writeFloatLE(v, i * 4));
    return buf;
  }

  static deserialize(buf){
    return new Matrix4([...Array(16)].map((_, i) => buf.readFloatLE(4 * i)));
  }

  multiplyVector(V){
    let v = [V.x, V.y, V.z];
    let m = this.vs;
    return new Vector3(
      v[0] * m[0] + v[1] * m[1] + v[2] * m[2] + m[3],
      v[0] * m[4] + v[1] * m[5] + v[2] * m[6] + m[7],
      v[0] * m[8] + v[1] * m[9] + v[2] * m[10] + m[11],
    );
  }

  multiply(that){
    let _g = (t, i, j) => t.vs[i * 4 + j];
    let g = (i, j) => _g(this, i, j);
    let G = (i, j) => _g(that, i, j);
    let c = (i, j) => [0, 1, 2, 3].map(x => g(i, x) * G(x, j)).reduce((a, b) => a + b);
    return new Matrix4(this.vs.map((_, x) => c(Math.floor(x / 4), x % 4)));
  }

  static scale(x, y, z){
    return new Matrix4([
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1,
    ]);
  }

  static rotateX(t){
    return new Matrix4([
      1, 0,    0,    0,
      0, c(t), S(t), 0,
      0, s(t), c(t), 0,
      0, 0,    0,    1,
    ]);
  }

  static rotateY(t){
    return new Matrix4([
      c(t), 0, s(t), 0,
      0,    1, 0,    0,
      S(t), 0, c(t), 0,
      0,    0, 0,    1,
    ]);
  }

  static rotateZ(t){
    return new Matrix4([
      c(t), s(t), 0, 0,
      S(t), c(t), 0, 0,
      0,    0,    1, 0,
      0,    0,    0, 1,
    ]);
  }

  static translate(x, y, z){
    return new Matrix4([
      1, 0, 0, x,
      0, 1, 0, y,
      0, 0, 1, z,
      0, 0, 0, 1,
    ])
  }

}

Product.Registry.register(Matrix4);

module.exports = { Matrix4 };
