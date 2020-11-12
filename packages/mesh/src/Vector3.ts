
export interface Vector3 {
  readonly x: number,
  readonly y: number,
  readonly z: number,
}

Object.defineProperty(_Vector3, "length", { writable: true })

export const Vector3 = Object.assign(
  _Vector3,
  {
    add: (a: Vector3, b: Vector3) =>
      Vector3(a.x + b.x, a.y + b.y, a.z + b.z),

    subtract: (a: Vector3, b: Vector3) =>
      Vector3(a.x - b.x, a.y - b.y, a.z - b.z),

    negate: (v: Vector3) =>
      Vector3(-v.x, -v.y, -v.z),

    multiplyComponents: (a: Vector3, b: Vector3) =>
      Vector3(a.x * b.x, a.y * b.y, a.z * b.z),

    multiplyScalar: (v: Vector3, n: number) =>
      Vector3(v.x * n, v.y * n, v.z * n),

    divideScalar: (v: Vector3, n: number) =>
      Vector3.multiplyScalar(v, 1 / n),

    dot: (a: Vector3, b: Vector3): number =>
      a.x * b.x + a.y * b.y + a.z * b.z,

    lerp: (a: Vector3, b: Vector3, t: number): Vector3 =>
      Vector3.add(a, Vector3.multiplyScalar(Vector3.subtract(b, a), t)),

    length: (v: Vector3): number =>
      Math.sqrt(Vector3.dot(v, v)),

    unit: (v: Vector3): Vector3 =>
      Vector3.divideScalar(v, Vector3.length(v)),

    cross: (a: Vector3, b: Vector3): Vector3 =>
      Vector3(
        a.y * b.z - a.z * b.y,
        a.z * b.x - a.x * b.z,
        a.x * b.y - a.y * b.x,
      ),
  }
)

function _Vector3(x: number, y: number, z: number): Vector3
function _Vector3(xyz: [number, number, number]): Vector3
function _Vector3(xyz: { x: number, y: number, z: number }): Vector3
function _Vector3(x: number | { x: number, y: number, z: number } | [number, number, number] = 0, y = 0, z = 0){
  if(typeof x === "object") {
    if(x instanceof Array)
      [x, y, z] = x
    else
      ({ x, y, z } = x)
  }

  return { x, y, z };
}
