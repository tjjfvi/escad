
import { Work, Component, Element, Hierarchy, Id } from ".";
import { Mesh } from "./Mesh";
import { Face } from "./Face";
import { Vector3 } from "./Vector3";

type CubeWorkArgs = [[number, number, number], [boolean, boolean, boolean]];
class CubeWork extends Work<CubeWork, Mesh, []> {

  type = CubeWork;

  static id = new Id("CubeWork", __filename);

  args: CubeWorkArgs;

  constructor(args: CubeWorkArgs) {
    super([]);
    this.args = args;
    this.freeze();
  }

  _serialize() {
    return Buffer.from(JSON.stringify(this.args));
  }

  static _deserialize(c: [], buf: Buffer) {
    return new CubeWork(JSON.parse(buf.toString("utf8")));
  }

  async execute() {
    let [[x, y, z], cs] = this.args;

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

type Triplet<T> = T | [T, T, T] | { x?: T, y?: T, z?: T } | { 0?: T, 1?: T, 2?: T };
type CubeArgs =
  & (
    | { sideLength: number }
    | { s: number }
    | { dimensions: Triplet<number> }
    | { d: Triplet<number> }
    | Triplet<number>
  )
  & (
    | { center: Triplet<boolean> }
    | { c: Triplet<boolean> }
    | { cx?: boolean, cy?: boolean, cz?: boolean }
  )

const cube: Component<[CubeArgs], Element<Mesh>> = new Component("cube", n => {
  let xyzT: Triplet<number> =
    "sideLength" in n ? n.sideLength :
      "s" in n ? n.s :
        "dimensions" in n ? n.dimensions :
          "d" in n ? n.d :
            n
  let xyzA: [number, number, number] =
    typeof xyzT === "number" ? [xyzT, xyzT, xyzT] :
      "0" in xyzT || "1" in xyzT || "2" in xyzT ? [xyzT["0"] ?? 0, xyzT["1"] ?? 0, xyzT["2"] ?? 0] :
        "x" in xyzT || "y" in xyzT || "z" in xyzT ? [xyzT.x ?? 0, xyzT.y ?? 0, xyzT.z ?? 0] :
          [0, 0, 0]
  let cT: Triplet<boolean> =
    "center" in n ? n.center :
      "c" in n ? n.c :
        [n.cx, n.cy, n.cz]
  let cA: [boolean, boolean, boolean] =
    typeof cT === "boolean" ? [cT, cT, cT] :
      "0" in cT || "1" in cT || "2" in cT ? [cT["0"] ?? true, cT["1"] ?? true, cT["2"] ?? true] :
        "x" in cT || "y" in cT || "z" in cT ? [cT.x ?? true, cT.y ?? true, cT.z ?? true] :
          [true, true, true];
  return new Element(new CubeWork([xyzA, cA]));
})

export { cube, CubeWork };
export type { CubeArgs };

