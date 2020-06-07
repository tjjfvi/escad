/* eslint-disable array-element-newline */

import { Vector3 } from "@escad/mesh";
import { Product, Id, FinishedProduct } from "@escad/core";
import { floatLE, Serializer, concat, SerializeFunc, DeserializeFunc } from "tszer";

const c = Math.cos;
const s = Math.sin;
const S = (x: number) => -Math.sin(x);

export type Sixteen<T> = [
  T, T, T, T,
  T, T, T, T,
  T, T, T, T,
  T, T, T, T,
];

class Matrix4 extends Product<Matrix4> {

  type = Matrix4;

  static id = new Id("Matrix4", __filename);

  vs: Sixteen<number>;

  constructor(vs: Sixteen<number>){
    super();
    if(vs.length !== 16)
      throw new Error("Must give 16 numbers to Matrix4");
    this.vs = vs;
  }

  clone(){
    return new Matrix4([...this.vs] as Sixteen<number>);
  }

  static serializer: () => Serializer<FinishedProduct<Matrix4>> = () =>
    concat(
      concat(floatLE(), floatLE(), floatLE(), floatLE()),
      concat(floatLE(), floatLE(), floatLE(), floatLE()),
      concat(floatLE(), floatLE(), floatLE(), floatLE()),
      concat(floatLE(), floatLE(), floatLE(), floatLE()),
    ).map<Sixteen<number>>({
      serialize: ([a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p]) =>
        [[a, b, c, d], [e, f, g, h], [i, j, k, l], [m, n, o, p]],
      deserialize: ([[a, b, c, d], [e, f, g, h], [i, j, k, l], [m, n, o, p]]) =>
        [a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p]
    }).map<FinishedProduct<Matrix4>>({
      serialize: matrix => matrix.vs,
      deserialize: vs => new Matrix4(vs).finish(),
    });

  serialize: SerializeFunc<FinishedProduct<Matrix4>> = Matrix4.serializer().serialize;

  static deserialize: DeserializeFunc<FinishedProduct<Matrix4>> = Matrix4.serializer().deserialize;

  multiplyVector(V: Vector3){
    let v = [V.x, V.y, V.z];
    let m = this.vs;
    return new Vector3(
      v[0] * m[0] + v[1] * m[1] + v[2] * m[2] + m[3],
      v[0] * m[4] + v[1] * m[5] + v[2] * m[6] + m[7],
      v[0] * m[8] + v[1] * m[9] + v[2] * m[10] + m[11],
    );
  }

  multiply(that: Matrix4){
    let _g = (t: Matrix4, i: number, j: number) => t.vs[i * 4 + j];
    let g = (i: number, j: number) => _g(this, i, j);
    let G = (i: number, j: number) => _g(that, i, j);
    let c = (i: number, j: number) => [0, 1, 2, 3].map(x => g(i, x) * G(x, j)).reduce((a, b) => a + b);
    return new Matrix4(this.vs.map((_, x) => c(Math.floor(x / 4), x % 4)) as Sixteen<number>);
  }

  static scale(x: number, y: number, z: number){
    return new Matrix4([
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1,
    ]);
  }

  static rotateX(t: number){
    return new Matrix4([
      1, 0, 0, 0,
      0, c(t), S(t), 0,
      0, s(t), c(t), 0,
      0, 0, 0, 1,
    ]);
  }

  static rotateY(t: number){
    return new Matrix4([
      c(t), 0, s(t), 0,
      0, 1, 0, 0,
      S(t), 0, c(t), 0,
      0, 0, 0, 1,
    ]);
  }

  static rotateZ(t: number){
    return new Matrix4([
      c(t), s(t), 0, 0,
      S(t), c(t), 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);
  }

  static translate(x: number, y: number, z: number){
    return new Matrix4([
      1, 0, 0, x,
      0, 1, 0, y,
      0, 0, 1, z,
      0, 0, 0, 1,
    ])
  }

  scale(x: number, y: number, z: number){
    return this.multiply(Matrix4.scale(x, y, z));
  }

  translate(x: number, y: number, z: number){
    return this.multiply(Matrix4.translate(x, y, z));
  }

  rotateX(t: number){
    return this.multiply(Matrix4.rotateX(t));
  }

  rotateY(t: number){
    return this.multiply(Matrix4.rotateY(t));
  }

  rotateZ(t: number){
    return this.multiply(Matrix4.rotateZ(t));
  }

}

Product.Registry.register(Matrix4);

export { Matrix4 };
