// @flow

import { Work, Component, Element, Hierarchy, Id } from ".";
import { Mesh } from "./Mesh";
import { Face } from "./Face";
import { Vector3 } from "./Vector3";

type CubeWorkArgs = [number, number, number, [boolean, boolean, boolean]];
class CubeWork extends Work<Mesh> {

  static id = new Id("CubeWork", __filename);

  args: CubeWorkArgs;

  constructor(args: CubeWorkArgs){
    super([]);
    this.args = args;
  }

  async execute(){
    let [x, y, z, cs] = this.args;

    let nx = cs[0] ? -x / 2 : 0;
    let ny = cs[1] ? -y / 2 : 0;
    let nz = cs[2] ? -z / 2 : 0;

    let px = cs[0] ? x / 2 : x;
    let py = cs[1] ? y / 2 : y;
    let pz = cs[2] ? z / 2 : z;

    let points = [
      new Vector3(px, py, pz),
      new Vector3(nx, py, pz),
      new Vector3(px, ny, pz),
      new Vector3(nx, ny, pz),
      new Vector3(px, py, nz),
      new Vector3(nx, py, nz),
      new Vector3(px, ny, nz),
      new Vector3(nx, ny, nz),
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

type Triplet<T> = T | [T, T, T];
type CubeArgs = [{|
  sideLength?: number,
  s?: number,
  dimensions?: [number, number, number],
  d?: [number, number, number],
  "0"?: number, "1"?: number, "2"?: number,
  x?: number, y?: number, z?: number,
  center?: boolean,
  c?: boolean,
  cx?: boolean, cy?: boolean, cz?: boolean,
|}]

const cube = new Component<CubeArgs, Element<Mesh>>("cube", n => {
  let {
    sideLength = 1, s = sideLength,
    dimensions = [s, s, s], d = dimensions,
    "0": X = d[0], "1": Y = d[1], "2": Z = d[2],
    x = X, y = Y, z = Z,
    center = true, c = center,
    __centers = c instanceof Array ? c : [c, c, c],
    cx = __centers[0], cy = __centers[1], cz = __centers[2],
  } = n instanceof Array ? { d: n } : typeof n === "number" ? { s: n } : n;
  return new Element<Mesh>(new CubeWork([x, y, z, [cx, cy, cz]]))
})

cube({ s: 1 });

export { cube, CubeWork };
export type { CubeArgs };

