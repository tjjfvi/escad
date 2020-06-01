
import { Product, Id } from "@escad/core";

class Vector3 extends Product<Vector3> {

  type = Vector3;

  static id = new Id("Vector3", __filename);

  x: number; y: number; z: number;

  constructor(x: number, y: number, z: number);
  constructor(xyz: [number, number, number]);
  constructor(xyz: { x: number, y: number, z: number });
  constructor(x: number | { x: number, y: number, z: number } | [number, number, number] = 0, y: number = 0, z: number = 0) {
    super();
    if (typeof x === "object") {
      if (x instanceof Array)
        [x, y, z] = x
      else
        ({ x, y, z } = x)
    }

    this.x = x;
    this.y = y;
    this.z = z;
  }

  clone() {
    return new Vector3(this.x, this.y, this.z);
  }

  serialize() {
    let buf = Buffer.alloc(12);
    buf.writeFloatLE(this.x, 0)
    buf.writeFloatLE(this.y, 4)
    buf.writeFloatLE(this.z, 8)
    return buf;
  }

  static deserialize(buf: Buffer) {
    return new Vector3(buf.readFloatLE(0), buf.readFloatLE(4), buf.readFloatLE(8));
  }

  add(that: Vector3) {
    return new Vector3(this.x + that.x, this.y + that.y, this.z + that.z);
  }

  subtract(that: Vector3) {
    return new Vector3(this.x - that.x, this.y - that.y, this.z - that.z);
  }

  negate() {
    return new Vector3(-this.x, -this.y, -this.z);
  }

  multiplyComponents(that: Vector3) {
    return new Vector3(this.x * that.x, this.y * that.y, this.z * that.z);
  }

  multiplyScalar(n: number) {
    return new Vector3(this.x * n, this.y * n, this.z * n);
  }

  divideScalar(n: number) {
    return this.multiplyScalar(1 / n);
  }

  dot(that: Vector3) {
    return this.x * that.x + this.y * that.y + this.z * that.z;
  }

  lerp(that: Vector3, t: number) {
    return this.add(that.subtract(this).multiplyScalar(t));
  }

  length() {
    return Math.sqrt(this.dot(this));
  }

  unit() {
    return this.divideScalar(this.length());
  }

  cross(that: Vector3) {
    return new Vector3(
      this.y * that.z - this.z * that.y,
      this.z * that.x - this.x * that.z,
      this.x * that.y - this.y * that.x,
    );
  }

}

Product.Registry.register(Vector3);

export { Vector3 };
