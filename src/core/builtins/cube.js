
import { Work, Element, Hierarchy, operators, Id } from ".";
import { Mesh } from "./Mesh";
import { Face } from "./Face";
import { Vector3 } from "./Vector3";

class CubeWork extends Work {

  static id = new Id("CubeWork", __filename);

  execute(){
    let [x, y, z, cs, func = x => x] = this.args;

    let nx = cs[0] ? -x / 2 : 0;
    let ny = cs[1] ? -y / 2 : 0;
    let nz = cs[2] ? -z / 2 : 0;

    let px = cs[0] ? x / 2 : x;
    let py = cs[1] ? y / 2 : y;
    let pz = cs[2] ? z / 2 : z;

    let points = [
      func(new Vector3(px, py, pz)),
      func(new Vector3(nx, py, pz)),
      func(new Vector3(px, ny, pz)),
      func(new Vector3(nx, ny, pz)),
      func(new Vector3(px, py, nz)),
      func(new Vector3(nx, py, nz)),
      func(new Vector3(px, ny, nz)),
      func(new Vector3(nx, ny, nz)),
    ];

    return new Mesh([
      [0, 1, 2],
      [3, 2, 1],
      [6, 5, 4],
      [5, 6, 7],
      [4, 1, 0],
      [5, 1, 4],
      [6, 2, 3],
      [6, 3, 7],
      [1, 7, 3],
      [5, 7, 1],
      [4, 0, 2],
      [6, 4, 2],
    ].map(ps => new Face(ps.map(i => points[i]))));
  }

}

Work.Registry.register(CubeWork);

operators.cube = (n, _center = true) => {
  let {
    sideLength = 1, s = sideLength,
    dimensions = [s, s, s], d = dimensions,
    0: X = d[0], 1: Y = d[1], 2: Z = d[2],
    x = X, y = Y, z = Z,
    center = _center, c = center,
    centers = typeof c === "boolean" ? [c, c, c] : c,
    cx = centers[0], cy = centers[1], cz = centers[2],
    cs = "xyz".split("")
      .map((p, i) => [centers[p], [cx, cy, cz][i]])
      .map(([a, b]) => a || b || (a == null && b == null)),
  } = typeof n === "object" ? n : { s: n };
  return new Element(new CubeWork([], new Hierarchy("cube"), x, y, z, cs));
}

