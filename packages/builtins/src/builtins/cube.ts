
import { Mesh } from "./Mesh";
import { Vector3 } from "./Vector3";
import { Work, Component, Element, Id } from "@escad/core";

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

    return Mesh.fromVertsFaces(points, [
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
    ])
  }

}

Work.Registry.register(CubeWork);

type TripletObj<T> = { x?: T, y?: T, z?: T, 0?: T, 1?: T, 2?: T };
type Triplet<T> = T | [T, T, T] | TripletObj<T>;
export interface CubeArgs extends TripletObj<number> {
  sideLength?: number,
  s?: number,
  dimensions?: Triplet<number>,
  d?: Triplet<number>,
  center?: Triplet<boolean>,
  c?: Triplet<boolean>,
  cx?: boolean,
  cy?: boolean,
  cz?: boolean,
}

const cube: Component<[CubeArgs], Element<Mesh>> = new Component("cube", n => {
  let xyzT: Triplet<number> =
    n.sideLength ??
    n.s ??
    n.dimensions ??
    n.d ??
    [n.x ?? 1, n.y ?? 1, n.z ?? 1]

  let xyzA: [number, number, number] =
    typeof xyzT === "number" ?
      [xyzT, xyzT, xyzT] :
      [xyzT[0] ?? xyzT.x ?? 0, xyzT[1] ?? xyzT.y ?? 0, xyzT[2] ?? xyzT.z ?? 0]

  let cT: Triplet<boolean> =
    n.center ??
    n.c ??
    [n.cx ?? true, n.cy ?? true, n.cz ?? true]

  let cA: [boolean, boolean, boolean] =
    typeof cT === "boolean" ?
      [cT, cT, cT] :
      [cT[0] ?? cT.x ?? true, cT[1] ?? cT.y ?? true, cT[2] ?? cT.z ?? true]

  return new Element(new CubeWork([xyzA, cA]));
})

export { cube, CubeWork };

